"use strict";
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import { VisualFormattingSettingsModel } from "./settings";

// ========== CAMBIOS REALIZADOS ==========
// COLOR_MODELO: 0xc7c7c7 -> 0xe0e0e0 (gris más claro)
// Luz direccional 1: 1.1 -> 2.0 (más intensa)
// Luz direccional 2: 0.5 -> 0.8 (más intensa)
// Luz ambiental: 0.6 -> 1.0 (más luz indirecta)
// ========================================

const COLOR_MODELO = 0xe0e0e0;      // <-- CAMBIADO: gris más claro
const COLOR_SELECCION = 0xffc107;
const COLOR_FONDO = 0xf5f5f5;

interface DatosElemento {
    vertices: number[];
    faces: number[];
    categoria: string;
    elementId: string;
}

export class Visual implements IVisual {
    private events: IVisualEventService;
    private target: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private grupoElementos: THREE.Group;
    private animationId: number;
    private primeraVezConDatos: boolean = true;

    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private meshSeleccionado: THREE.Mesh | null = null;
    private panelInfo: HTMLDivElement;

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;

        this.target.style.width = "100%";
        this.target.style.height = "100%";
        this.target.style.position = "relative";
        this.target.style.overflow = "hidden";

        this.initThreeJS();
    }

    private initThreeJS(): void {
        const width = this.target.clientWidth || 300;
        const height = this.target.clientHeight || 300;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(COLOR_FONDO);

        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.domElement.style.display = "block";
        this.target.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.screenSpacePanning = true;

        // ========== ILUMINACIÓN AJUSTADA ==========
        const light = new THREE.DirectionalLight(0xffffff, 2.0);  // <-- CAMBIADO: 1.1 -> 2.0
        light.position.set(5, 10, 5);
        this.scene.add(light);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.8);  // <-- CAMBIADO: 0.5 -> 0.8
        light2.position.set(-5, 5, -5);
        this.scene.add(light2);

        this.scene.add(new THREE.AmbientLight(0xffffff, 1.0));     // <-- CAMBIADO: 0.6 -> 1.0
        // ==========================================

        this.grupoElementos = new THREE.Group();
        this.scene.add(this.grupoElementos);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.panelInfo = document.createElement('div');
        this.panelInfo.style.cssText = "position:absolute;bottom:8px;left:8px;background:rgba(255,255,255,0.95);color:#1e293b;font-size:12px;padding:8px 12px;border-radius:6px;font-family:sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.15);display:none;max-width:90%;";
        this.target.appendChild(this.panelInfo);

        this.renderer.domElement.addEventListener('click', this.onClickElemento);

        this.mostrarCuboRespaldo();
        this.animate();
    }

    private onClickElemento = (event: MouseEvent): void => {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.grupoElementos.children);

        if (this.meshSeleccionado) {
            (this.meshSeleccionado.material as THREE.MeshStandardMaterial).color.setHex(COLOR_MODELO);
            this.meshSeleccionado = null;
        }

        if (intersects.length > 0) {
            const mesh = intersects[0].object as THREE.Mesh;
            const material = mesh.material as THREE.MeshStandardMaterial;

            material.color.setHex(COLOR_SELECCION);
            this.meshSeleccionado = mesh;

            const datos = mesh.userData as DatosElemento;
            this.panelInfo.innerHTML =
                "<strong>ID:</strong> " + (datos.elementId || "?") +
                "<br><strong>Categoria:</strong> " + (datos.categoria || "Sin categoria");
            this.panelInfo.style.display = "block";
        } else {
            this.panelInfo.style.display = "none";
        }
    }

    private mostrarCuboRespaldo(): void {
        this.grupoElementos.clear();
        this.meshSeleccionado = null;
        this.panelInfo.style.display = "none";
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: COLOR_MODELO });
        const mesh = new THREE.Mesh(geometry, material);
        this.grupoElementos.add(mesh);
    }

    private mostrarElementos(elementos: DatosElemento[]): void {
        this.grupoElementos.clear();
        this.meshSeleccionado = null;
        this.panelInfo.style.display = "none";

        for (const el of elementos) {
            if (!el.vertices || el.vertices.length === 0) continue;

            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array(el.vertices);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

            if (el.faces && el.faces.length > 0) {
                geometry.setIndex(el.faces);
            }

            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({
                color: COLOR_MODELO,
                side: THREE.DoubleSide,
                metalness: 0.05,
                roughness: 0.85
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData = { elementId: el.elementId, categoria: el.categoria } as DatosElemento;
            this.grupoElementos.add(mesh);
        }

        if (this.primeraVezConDatos) {
            const box = new THREE.Box3().setFromObject(this.grupoElementos);
            if (!box.isEmpty()) {
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z, 1);

                this.grupoElementos.position.sub(center);

                const distancia = maxDim * 1.8;
                this.camera.position.set(distancia, distancia, distancia);
                this.camera.lookAt(0, 0, 0);
                this.camera.far = distancia * 10;
                this.camera.updateProjectionMatrix();

                this.controls.target.set(0, 0, 0);
                this.controls.update();
            }
            this.primeraVezConDatos = false;
        }
    }

    private animate = (): void => {
        this.animationId = requestAnimationFrame(this.animate);

        if (this.controls) {
            this.controls.update();
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        try {
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel,
                options.dataViews[0]
            );

            const width = Math.max(options.viewport.width, 50);
            const height = Math.max(options.viewport.height, 50);

            if (this.renderer && this.camera) {
                this.renderer.setSize(width, height);
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
            }

            const dataView = options.dataViews && options.dataViews[0];
            let datosEncontrados = false;

            if (dataView && dataView.table) {
                const table = dataView.table;
                const columns = table.columns;
                const rows = table.rows;

                let idxElementId = -1, idxCategory = -1, idxVertices = -1, idxFaces = -1;

                for (let i = 0; i < columns.length; i++) {
                    const roles = columns[i].roles;
                    if (roles && roles["elementId"]) idxElementId = i;
                    if (roles && roles["category"]) idxCategory = i;
                    if (roles && roles["vertices"]) idxVertices = i;
                    if (roles && roles["faces"]) idxFaces = i;
                }

                const listaElementos: DatosElemento[] = [];

                for (const row of rows) {
                    const elementId = idxElementId >= 0 ? String(row[idxElementId]) : "";
                    const categoria = idxCategory >= 0 ? String(row[idxCategory]) : "Sin categoria";
                    const verticesRaw = idxVertices >= 0 ? row[idxVertices] : null;
                    const facesRaw = idxFaces >= 0 ? row[idxFaces] : null;

                    if (!verticesRaw) continue;

                    try {
                        const verticesArr = JSON.parse(String(verticesRaw));
                        const facesArr = facesRaw ? JSON.parse(String(facesRaw)) : [];

                        if (Array.isArray(verticesArr) && verticesArr.length > 0) {
                            listaElementos.push({ vertices: verticesArr, faces: facesArr, categoria: categoria, elementId: elementId });
                        }
                    } catch (e) {
                        // valor invalido, se ignora
                    }
                }

                if (listaElementos.length > 0) {
                    this.mostrarElementos(listaElementos);
                    datosEncontrados = true;
                }
            }

            if (!datosEncontrados) {
                this.mostrarCuboRespaldo();
            }

            this.events.renderingFinished(options);
        }
        catch (error) {
            this.events.renderingFailed(options, String(error));
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    public destroy(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.controls) {
            this.controls.dispose();
        }
        this.renderer.domElement.removeEventListener('click', this.onClickElemento);
    }
}
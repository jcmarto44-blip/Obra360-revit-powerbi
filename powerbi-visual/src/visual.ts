"use strict";
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import * as THREE from "three";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import { VisualFormattingSettingsModel } from "./settings";

const COLORES_CATEGORIA: { [key: string]: number } = {
    "Walls": 0x2563eb,
    "Floors": 0x16a34a,
    "Doors": 0xca8a04,
    "Windows": 0x0891b2,
    "Roofs": 0xdc2626,
    "Structural Framing": 0x9333ea,
    "Structural Columns": 0x9333ea,
    "Pipes": 0xea580c,
    "Ducts": 0x64748b,
};

function colorParaCategoria(categoria: string): number {
    if (categoria && COLORES_CATEGORIA[categoria]) {
        return COLORES_CATEGORIA[categoria];
    }
    return 0x94a3b8;
}

export class Visual implements IVisual {
    private events: IVisualEventService;
    private target: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private grupoElementos: THREE.Group;
    private animationId: number;
    private debugDiv: HTMLDivElement;

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
        this.scene.background = new THREE.Color(0xf0f0f0);

        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.domElement.style.display = "block";
        this.target.appendChild(this.renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 5);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x808080));

        this.grupoElementos = new THREE.Group();
        this.scene.add(this.grupoElementos);

        this.debugDiv = document.createElement('div');
        this.debugDiv.style.cssText = "position:absolute;top:0;left:0;background:yellow;color:black;font-size:11px;padding:4px;z-index:9999;max-width:100%;word-break:break-all;font-family:monospace;";
        this.target.appendChild(this.debugDiv);

        this.mostrarCuboRespaldo();
        this.animate();
    }

    private mostrarCuboRespaldo(): void {
        this.grupoElementos.clear();
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x999999 });
        const mesh = new THREE.Mesh(geometry, material);
        this.grupoElementos.add(mesh);
    }

    private mostrarElementos(elementos: { vertices: number[], faces: number[], categoria: string }[]): void {
        this.grupoElementos.clear();

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
                color: colorParaCategoria(el.categoria),
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geometry, material);
            this.grupoElementos.add(mesh);
        }

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
        }
    }

    private animate = (): void => {
        this.animationId = requestAnimationFrame(this.animate);
        if (this.grupoElementos) {
            this.grupoElementos.rotation.y += 0.003;
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
            let debug = "";

            if (!dataView) {
                debug = "NO HAY dataView";
            } else if (!dataView.table) {
                debug = "NO HAY dataView.table";
            } else {
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

                debug = "cols=" + columns.length + " rows=" + rows.length +
                    " idx(id=" + idxElementId + ",cat=" + idxCategory + ",vert=" + idxVertices + ",faces=" + idxFaces + ")";

                const listaElementos: { vertices: number[], faces: number[], categoria: string }[] = [];

                for (const row of rows) {
                    const categoria = idxCategory >= 0 ? String(row[idxCategory]) : "Sin categoria";
                    const verticesRaw = idxVertices >= 0 ? row[idxVertices] : null;
                    const facesRaw = idxFaces >= 0 ? row[idxFaces] : null;

                    if (!verticesRaw) continue;

                    try {
                        const verticesArr = JSON.parse(String(verticesRaw));
                        const facesArr = facesRaw ? JSON.parse(String(facesRaw)) : [];

                        if (Array.isArray(verticesArr) && verticesArr.length > 0) {
                            listaElementos.push({ vertices: verticesArr, faces: facesArr, categoria: categoria });
                        }
                    } catch (e) {
                        debug += " | ERROR_PARSE:" + String(verticesRaw).substring(0, 40);
                    }
                }

                debug += " | elementosValidos=" + listaElementos.length;

                if (listaElementos.length > 0) {
                    this.mostrarElementos(listaElementos);
                    datosEncontrados = true;
                }
            }

            if (!datosEncontrados) {
                this.mostrarCuboRespaldo();
            }

            if (this.debugDiv) {
                this.debugDiv.textContent = debug;
            }

            this.events.renderingFinished(options);
        }
        catch (error) {
            if (this.debugDiv) {
                this.debugDiv.textContent = "ERROR: " + String(error);
            }
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
    }
}
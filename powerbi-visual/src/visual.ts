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

export class Visual implements IVisual {
    private events: IVisualEventService;
    private target: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private currentMesh: THREE.Mesh;
    private animationId: number;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor - Obra360Pulse');
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

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(2, 2, 2);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.domElement.style.display = "block";
        this.target.appendChild(this.renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(2, 2, 2);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x808080));

        this.mostrarCuboRespaldo();

        this.animate();
    }

    private mostrarCuboRespaldo(): void {
        if (this.currentMesh) {
            this.scene.remove(this.currentMesh);
        }
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x999999 });
        this.currentMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.currentMesh);
    }

    private mostrarGeometriaReal(verticesFlat: number[], facesFlat: number[]): void {
        if (this.currentMesh) {
            this.scene.remove(this.currentMesh);
        }

        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(verticesFlat);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        if (facesFlat && facesFlat.length > 0) {
            geometry.setIndex(facesFlat);
        }

        geometry.computeVertexNormals();
        geometry.center();

        const material = new THREE.MeshStandardMaterial({
            color: 0x2563eb,
            side: THREE.DoubleSide
        });

        this.currentMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.currentMesh);
    }

    private animate = (): void => {
        this.animationId = requestAnimationFrame(this.animate);
        if (this.currentMesh) {
            this.currentMesh.rotation.y += 0.01;
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

            if (dataView && dataView.categorical && dataView.categorical.values) {
                const values = dataView.categorical.values;

                let verticesRaw: string = null;
                let facesRaw: string = null;

                for (const col of values) {
                    const roles = col.source.roles;
                    if (roles && roles["vertices"] && col.values.length > 0) {
                        verticesRaw = String(col.values[0]);
                    }
                    if (roles && roles["faces"] && col.values.length > 0) {
                        facesRaw = String(col.values[0]);
                    }
                }

                if (verticesRaw) {
                    try {
                        const verticesArr = JSON.parse(verticesRaw);
                        const facesArr = facesRaw ? JSON.parse(facesRaw) : [];

                        if (Array.isArray(verticesArr) && verticesArr.length > 0) {
                            this.mostrarGeometriaReal(verticesArr, facesArr);
                            datosEncontrados = true;
                        }
                    } catch (e) {
                        console.log('Error al parsear geometria:', e);
                    }
                }
            }

            if (!datosEncontrados && !this.currentMesh) {
                this.mostrarCuboRespaldo();
            }

            this.events.renderingFinished(options);
        }
        catch (error) {
            console.log('Error in update method', error);
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
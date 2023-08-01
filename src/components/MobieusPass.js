import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass'
import { PencilLinesMaterial } from './MoebiusMaterial'
import * as THREE from 'three'

export class PencilLinesPass extends Pass {
    constructor(width, height, scene, camera) {
        super()
        this.scene = scene;
        this.camera = camera;

        this.material = new PencilLinesMaterial();
        this.fsQuad = new FullScreenQuad(this.material);
        this.material.uniforms.uResolution.value = new THREE.Vector2(width, height);

        // for normal buffer
        const normalBuffer = new THREE.WebGLRenderTarget(width, height);

        normalBuffer.texture.format = THREE.RGBAFormat;
        normalBuffer.texture.type = THREE.HalfFloatType;
        normalBuffer.texture.minFilter = THREE.NearestFilter;
        normalBuffer.texture.magFilter = THREE.NearestFilter;
        normalBuffer.texture.generateMipmaps = false;
        normalBuffer.stencilBuffer = false;
        this.normalBuffer = normalBuffer;

        this.normalMaterial = new THREE.ShaderMaterial({
            uniforms: {
                lightPos: { value: new THREE.Vector3(0, 4.0, 0.0) },
                cameraPos: {value: new THREE.Vector3(0, 0, 0)}
            },
            vertexShader: `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
        
            void main() {
                vNormal = normalize(mat3(modelMatrix) * normal);
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));
            }
            
            `,
            fragmentShader: `
            uniform vec3 cameraPos;
            uniform vec3 lightPos; // in world space
        
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
        
            void main() {
                // Calculate view direction in world space
                vec3 viewDir = normalize(cameraPos - vWorldPosition);
        
                // Specular term
                vec3 lightDir = normalize(lightPos - vWorldPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), length(lightPos - vWorldPosition) * 4.0);
                // gl_FragColor = vec4(spec, spec, spec, 1.0);

                // diffuse term
                float diff = max(dot(vNormal, lightDir), 0.0);
                if (spec > 0.59){
                    gl_FragColor = vec4(100000.0, 100000.0, 100000.0, 1.0);
                }else if (diff > 0.95){
                    gl_FragColor = vec4(2000.0, 2000.0, 2000.0, 1.0);
                }else{
                    gl_FragColor = vec4(vNormal, 1.0);
                }
                // gl_FragColor = vec4(viewDir, 1.0);
            }
            `
        }
        );
    }

    dispose() {
        this.material.dispose();
        this.fsQuad.dispose();
    }

    render(
        renderer,
        writeBuffer,
        readBuffer
    ) {

        renderer.setRenderTarget(this.normalBuffer);
        const overrideMaterialBefore = this.scene.overrideMaterial;

        this.normalMaterial.uniforms.cameraPos.value = this.camera.position;
        this.scene.overrideMaterial = this.normalMaterial;

        renderer.render(this.scene, this.camera);
        this.scene.overrideMaterial = overrideMaterialBefore;
        this.material.uniforms.uNormals.value = this.normalBuffer.texture;
        this.material.uniforms.tDiffuse.value = readBuffer.texture;


        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
            this.fsQuad.render(renderer);
        } else {
            renderer.setRenderTarget(writeBuffer);
            if (this.clear) renderer.clear();
            this.fsQuad.render(renderer);
        }
    }
    changeLight(lightPos) {
        this.normalMaterial.uniforms.lightPos.value = lightPos;
    }

    // resize the canvas
    resize(width, height) {
        this.material.uniforms.uResolution.value = new THREE.Vector2(width, height);
    }
}

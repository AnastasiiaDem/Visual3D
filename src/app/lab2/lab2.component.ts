import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {Color} from 'three';

@Component({
  selector: 'app-lab2',
  templateUrl: './lab2.component.html',
  styleUrls: ['./lab2.component.scss']
})
export class Lab2Component implements OnInit, AfterViewInit {
  
  @ViewChild('canvas')
  private canvasRef: ElementRef;
  @Input() public rotationSpeedX: number = 0.05;
  @Input() public rotationSpeedY: number = 0.01;
  @Input() public size: number = 200;
  @Input() public texture: string = './assets/texture.jpg';
  @Input() public cameraZ: number = 400;
  @Input() public cameraY: number = 400;
  @Input() public cameraX: number = 400;
  @Input() public fieldOfView: number = 45;
  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 1000;
  
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  
  private controls: OrbitControls;
  private axesHelper = new THREE.AxesHelper(600);
  private light = new THREE.PointLight('#ffe945');
  private cube = new THREE.Group();
  
  B00: any[] = [];
  B01: any[] = [];
  B02: any[] = [];
  B03: any[] = [];
  B10: any[] = [];
  B11: any[] = [];
  B12: any[] = [];
  B13: any[] = [];
  B20: any[] = [];
  B21: any[] = [];
  B22: any[] = [];
  B23: any[] = [];
  B30: any[] = [];
  B31: any[] = [];
  B32: any[] = [];
  B33: any[] = [];
  
  uValue: number;
  wValue: number;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cameraAngle: number;
  camRadius: number;
  
  xPos = 0;
  yPos = 0;
  zPos = 0;
  xAngle = 0;
  yAngle = 0;
  zAngle = 0;
  xScale = 1;
  yScale = 1;
  zScale = 1;
  
  arrowHelper1: THREE.ArrowHelper;
  arrowHelper2: THREE.ArrowHelper;
  arrowHelper3: THREE.ArrowHelper;
  arrowDirection1 = new THREE.Vector3();
  arrowDirection2 = new THREE.Vector3();
  arrowDirection3 = new THREE.Vector3();
  
  points: any[] = [];
  surfacePoints: any[] = [];
  
  point00: any[] = [];
  point01: any[] = [];
  point02: any[] = [];
  point03: any[] = [];
  point10: any[] = [];
  point11: any[] = [];
  point12: any[] = [];
  point13: any[] = [];
  point20: any[] = [];
  point21: any[] = [];
  point22: any[] = [];
  point23: any[] = [];
  point30: any[] = [];
  point31: any[] = [];
  point32: any[] = [];
  point33: any[] = [];
  
  lineControl1: any[] = [];
  lineControl2: any[] = [];
  lineControl3: any[] = [];
  lineControl4: any[] = [];
  lineControl5: any[] = [];
  
  private noDivisions = 10;
  private step: any;
  private material: THREE.MeshPhysicalMaterial;
  private uvArray: any[] = [];
  surfaceMesh: any[] = [];
  geometry: any[] = [];
  geometry1: any[] = [];
  geometry2: any[] = [];
  geometry3: any[] = [];
  geometry4: any[] = [];
  geometry5: any[] = [];
  array: any;
  
  init() {
    this.initializeValues();
    this.createScene();
    
    this.material = new THREE.MeshPhysicalMaterial({
      side: THREE.DoubleSide,
      color: '#a6b6e8',
      emissive: '#3459ec',
      opacity: 0.4,
      metalness: 0,
      ior: 2.333,
      specularIntensity: 1,
      transparent: true,
      transmission: 1,
      roughness: 0.07,
      envMapIntensity: 1.5,
    });
  
    this.material.thickness = 1.5;
    this.material.specularTint = new Color('#fff');
    
    this.renderer.setClearColor(new THREE.Color('#fff'));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    let axes = new THREE.AxesHelper(1);
    this.scene.add(axes);
    
    let origin = new THREE.Vector3(0, 0, 0);
    let xArrowPos = new THREE.Vector3(1, 0, 0);
    let yArrowPos = new THREE.Vector3(0, 1, 0);
    let zArrowPos = new THREE.Vector3(0, 0, 1);
    
    this.arrowDirection1.subVectors(xArrowPos, origin).normalize();
    this.arrowHelper1 = new THREE.ArrowHelper(
      this.arrowDirection1,
      origin,
      100,
      '#fd2d2d',
      0.07,
      0.04
    );
    this.scene.add(this.arrowHelper1);
    
    this.arrowDirection2.subVectors(yArrowPos, origin).normalize();
    this.arrowHelper2 = new THREE.ArrowHelper(
      this.arrowDirection2,
      origin,
      100,
      '#2afc2a',
      0.07,
      0.04
    );
    this.scene.add(this.arrowHelper2);
    
    this.arrowDirection3.subVectors(zArrowPos, origin).normalize();
    this.arrowHelper3 = new THREE.ArrowHelper(
      this.arrowDirection3,
      origin,
      100,
      '#2828fa',
      0.07,
      0.04
    );
    this.scene.add(this.arrowHelper3);
  
    let spotLight = new THREE.SpotLight("#fff");
    spotLight.position.set( 30, 30, 10 );
    this.scene.add(spotLight);
    
    this.handleCameraAngle();
    this.computeBezierSurface();
    this.move();
    this.render();
  }
  
  private createScene() {
    //* Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#fff');
    this.light.position.set(200, 50, 200);
    this.scene.add(this.light);
    this.scene.add(this.cube);
    this.cube.translateOnAxis(new THREE.Vector3(0, 0, 0), 1);
    this.scene.add(this.axesHelper);
    
    //*Camera
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    );
    // this.camera.position.z = this.cameraZ;
    this.camera.up.set(0, 0, 1);
    
    // this.camera.position.y = this.cameraY;
    // this.camera.position.x = this.cameraX;
    this.camera.position.set(400, 100, 300);
    
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    
  }
  
  private createControls = () => {
    const renderer = new CSS2DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    document.body.appendChild(renderer.domElement);
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.update();
  };
  
  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }
  
  private startRenderingLoop() {
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  
    let component: Lab2Component = this;
    (function render() {
      requestAnimationFrame(render);
      component.renderer.render(component.scene, component.camera);
    }());
  }
  
  constructor() {
  }
  
  ngOnInit(): void {
  }
  
  ngAfterViewInit() {
    this.init();
    // this.createScene();
    this.startRenderingLoop();
    this.createControls();
  }
  
  rotate() {
    for (let i = 0; i < 3; i++) {
      this.surfaceMesh[i].rotation.x = (Math.PI * this.xAngle) / 180;
      this.surfaceMesh[i].rotation.y = (Math.PI * this.yAngle) / 180;
      this.surfaceMesh[i].rotation.z = (Math.PI * this.zAngle) / 180;
      this.scene.add(this.surfaceMesh[i]);
    }
    
    this.computeBezierSurface();
  }
  
  move() {
    for (let i = 0; i < 3; i++) {
      this.surfaceMesh[i].position.x = this.xPos;
      this.surfaceMesh[i].position.y = this.yPos;
      this.surfaceMesh[i].position.z = this.zPos + 0.01;
      this.scene.add(this.surfaceMesh[i]);
    }
    this.computeBezierSurface();
  }
  
  scale() {
    for (let i = 0; i < 3; i++) {
      this.surfaceMesh[i].scale.x = this.xScale;
      this.surfaceMesh[i].scale.y = this.yScale;
      this.surfaceMesh[i].scale.z = this.zScale;
      this.scene.add(this.surfaceMesh[i]);
    }
    this.computeBezierSurface();
  }
  
  handleCameraAngle() {
    let angle = (this.cameraAngle * Math.PI) / 180.0;
    let xCam = this.camRadius * Math.sin(angle);
    let yCam = this.camRadius * Math.cos(angle);
    this.camera.position.set(xCam, yCam, 10);
    this.camera.lookAt(this.scene.position);
    
    this.render();
  }
  
  renderSurface(i: number) {
    this.scene.remove(this.surfaceMesh[i]);
  
    this.geometry.push(new THREE.BufferGeometry());
    
    const indices = [];
    indices.length = 0;
    
    for (let i = 0; i < this.noDivisions; i++) {
      for (let j = 0; j < this.noDivisions; j++) {
        const a = i * (this.noDivisions + 1) + (j + 1);
        const b = i * (this.noDivisions + 1) + j;
        const c = (i + 1) * (this.noDivisions + 1) + j;
        const d = (i + 1) * (this.noDivisions + 1) + (j + 1);
        
        // generate two faces (triangles) per iteration
        indices.push(a, b, d); // face one
        indices.push(b, c, d); // face two
      }
    }
    
    if (i === 0) {
      this.surfacePoints = this.surfacePoints.slice(0, 363);
    } else {
      this.surfacePoints = this.surfacePoints.slice(363, 726);
    }
    
    this.geometry[i].setAttribute(
      'position',
      new THREE.Float32BufferAttribute(this.surfacePoints, 3).onUpload(() => this.array = null)
    );
    const uvNumComponents = 2;
    this.geometry[i].setAttribute(
      'uv',
      new THREE.BufferAttribute(
        new Float32Array(this.uvArray),
        uvNumComponents
      ).onUpload(() => this.array = null)
    );
    this.geometry[i].setIndex(indices);
    this.geometry[i].computeVertexNormals();
    
    this.surfaceMesh.push(new THREE.Mesh(this.geometry[i], this.material));
    this.surfaceMesh[i].material.needsUpdate = true;
    this.scene.add(this.surfaceMesh[i]);
    
    this.render();
  }
  
  setupGrid(i: number) {
    this.scene.remove(this.point10[i]);
    this.scene.remove(this.point11[i]);
    this.scene.remove(this.point12[i]);
    this.scene.remove(this.point13[i]);
    
    this.scene.remove(this.point20[i]);
    this.scene.remove(this.point21[i]);
    this.scene.remove(this.point22[i]);
    this.scene.remove(this.point23[i]);
    
    this.scene.remove(this.point30[i]);
    this.scene.remove(this.point31[i]);
    this.scene.remove(this.point32[i]);
    this.scene.remove(this.point33[i]);
    
    this.scene.remove(this.lineControl1[i]);
    this.scene.remove(this.lineControl2[i]);
    this.scene.remove(this.lineControl3[i]);
    this.scene.remove(this.lineControl4[i]);
    this.scene.remove(this.lineControl5[i]);
    
    let sphereGeometry = new THREE.SphereGeometry(0.1, 20, 20);
    
    let sphereMaterialRed = new THREE.MeshBasicMaterial({
      color: 0xfa8072,
      wireframe: false,
    });
    
    let sphereMaterialGreen = new THREE.MeshBasicMaterial({
      color: 0x90ee90,
      wireframe: false,
    });
    
    let sphereMaterialBlue = new THREE.MeshBasicMaterial({
      color: 0x87cefa,
      wireframe: false,
    });
    
    let sphereMaterialYellow = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: false,
    });
    
    
    // Red Points
    this.point00.push(new THREE.Mesh(sphereGeometry, sphereMaterialRed));
    this.point00[i].position.x = this.B00[i][0];
    this.point00[i].position.y = this.B00[i][1];
    this.point00[i].position.z = this.B00[i][2];
    
    this.point01.push(new THREE.Mesh(sphereGeometry, sphereMaterialRed));
    this.point01[i].position.x = this.B01[i][0];
    this.point01[i].position.y = this.B01[i][1];
    this.point01[i].position.z = this.B01[i][2];
    
    this.point02.push(new THREE.Mesh(sphereGeometry, sphereMaterialRed));
    this.point02[i].position.x = this.B02[i][0];
    this.point02[i].position.y = this.B02[i][1];
    this.point02[i].position.z = this.B02[i][2];
    
    this.point03.push(new THREE.Mesh(sphereGeometry, sphereMaterialRed));
    this.point03[i].position.x = this.B03[i][0];
    this.point03[i].position.y = this.B03[i][1];
    this.point03[i].position.z = this.B03[i][2];
    
    this.point00.push(new THREE.Mesh(sphereGeometry, sphereMaterialRed));
    this.point00[i].position.x = this.B00[i][0];
    this.point00[i].position.y = this.B00[i][1];
    this.point00[i].position.z = this.B00[i][2];
    
    // Green points
    this.point10.push(new THREE.Mesh(sphereGeometry, sphereMaterialGreen));
    this.point10[i].position.x = this.B10[i][0];
    this.point10[i].position.y = this.B10[i][1];
    this.point10[i].position.z = this.B10[i][2];
    
    this.point11.push(new THREE.Mesh(sphereGeometry, sphereMaterialGreen));
    this.point11[i].position.x = this.B11[i][0];
    this.point11[i].position.y = this.B11[i][1];
    this.point11[i].position.z = this.B11[i][2];
    
    this.point12.push(new THREE.Mesh(sphereGeometry, sphereMaterialGreen));
    this.point12[i].position.x = this.B12[i][0];
    this.point12[i].position.y = this.B12[i][1];
    this.point12[i].position.z = this.B12[i][2];
    
    this.point13.push(new THREE.Mesh(sphereGeometry, sphereMaterialGreen));
    this.point13[i].position.x = this.B13[i][0];
    this.point13[i].position.y = this.B13[i][1];
    this.point13[i].position.z = this.B13[i][2];
    
    // Blue points
    this.point20.push(new THREE.Mesh(sphereGeometry, sphereMaterialBlue));
    this.point20[i].position.x = this.B20[i][0];
    this.point20[i].position.y = this.B20[i][1];
    this.point20[i].position.z = this.B20[i][2];
    
    this.point21.push(new THREE.Mesh(sphereGeometry, sphereMaterialBlue));
    this.point21[i].position.x = this.B21[i][0];
    this.point21[i].position.y = this.B21[i][1];
    this.point21[i].position.z = this.B21[i][2];
    
    this.point22.push(new THREE.Mesh(sphereGeometry, sphereMaterialBlue));
    this.point22[i].position.x = this.B22[i][0];
    this.point22[i].position.y = this.B22[i][1];
    this.point22[i].position.z = this.B22[i][2];
    
    this.point23.push(new THREE.Mesh(sphereGeometry, sphereMaterialBlue));
    this.point23[i].position.x = this.B23[i][0];
    this.point23[i].position.y = this.B23[i][1];
    this.point23[i].position.z = this.B23[i][2];
    
    // Yellow points
    this.point30.push(new THREE.Mesh(sphereGeometry, sphereMaterialYellow));
    this.point30[i].position.x = this.B30[i][0];
    this.point30[i].position.y = this.B30[i][1];
    this.point30[i].position.z = this.B30[i][2];
    
    this.point31.push(new THREE.Mesh(sphereGeometry, sphereMaterialYellow));
    this.point31[i].position.x = this.B31[i][0];
    this.point31[i].position.y = this.B31[i][1];
    this.point31[i].position.z = this.B31[i][2];
    
    this.point32.push(new THREE.Mesh(sphereGeometry, sphereMaterialYellow));
    this.point32[i].position.x = this.B32[i][0];
    this.point32[i].position.y = this.B32[i][1];
    this.point32[i].position.z = this.B32[i][2];
    
    this.point33.push(new THREE.Mesh(sphereGeometry, sphereMaterialYellow));
    this.point33[i].position.x = this.B33[i][0];
    this.point33[i].position.y = this.B33[i][1];
    this.point33[i].position.z = this.B33[i][2];
    
    // scene.add(this.point00[i]);
    // scene.add(this.point01[i]);
    // scene.add(this.point02[i]);
    // scene.add(this.point03[i]);
    //
    // scene.add(this.point10[i]);
    // scene.add(this.point11[i]);
    // scene.add(this.point12[i]);
    // scene.add(this.point13[i]);
    //
    // scene.add(this.point20[i]);
    // scene.add(this.point21[i]);
    // scene.add(this.point22[i]);
    // scene.add(this.point23[i]);
    //
    // scene.add(this.point30[i]);
    // scene.add(this.point31[i]);
    // scene.add(this.point32[i]);
    // scene.add(this.point33[i]);
    
    let material = new THREE.LineBasicMaterial({
      color: '#ffff00',
      opacity: 0.25,
      transparent: true,
    });
    
    this.geometry1.push(new THREE.BufferGeometry());
    let vertices = [];
    vertices.push(this.B00[i][0], this.B00[i][1], this.B00[i][2]);
    vertices.push(this.B01[i][0], this.B01[i][1], this.B01[i][2]);
    vertices.push(this.B02[i][0], this.B02[i][1], this.B02[i][2]);
    vertices.push(this.B03[i][0], this.B03[i][1], this.B03[i][2]);
    vertices.push(this.B13[i][0], this.B13[i][1], this.B13[i][2]);
    vertices.push(this.B23[i][0], this.B23[i][1], this.B23[i][2]);
    vertices.push(this.B33[i][0], this.B33[i][1], this.B33[i][2]);
    vertices.push(this.B32[i][0], this.B32[i][1], this.B32[i][2]);
    vertices.push(this.B31[i][0], this.B31[i][1], this.B31[i][2]);
    vertices.push(this.B30[i][0], this.B30[i][1], this.B30[i][2]);
    vertices.push(this.B20[i][0], this.B20[i][1], this.B20[i][2]);
    vertices.push(this.B10[i][0], this.B10[i][1], this.B10[i][2]);
    vertices.push(this.B00[i][0], this.B00[i][1], this.B00[i][2]);
    this.geometry1[i].setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.lineControl1.push(new THREE.Line(this.geometry1[i], material));
    
    this.geometry2.push(new THREE.BufferGeometry());
    vertices.length = 0;
    vertices.push(this.B01[i][0], this.B01[i][1], this.B01[i][2]);
    vertices.push(this.B11[i][0], this.B11[i][1], this.B11[i][2]);
    vertices.push(this.B21[i][0], this.B21[i][1], this.B21[i][2]);
    vertices.push(this.B31[i][0], this.B31[i][1], this.B31[i][2]);
    this.geometry2[i].setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.lineControl2.push(new THREE.Line(this.geometry2[i], material));
    
    this.geometry3.push(new THREE.BufferGeometry());
    vertices.length = 0;
    vertices.push(this.B02[i][0], this.B02[i][1], this.B02[i][2]);
    vertices.push(this.B12[i][0], this.B12[i][1], this.B12[i][2]);
    vertices.push(this.B22[i][0], this.B22[i][1], this.B22[i][2]);
    vertices.push(this.B32[i][0], this.B32[i][1], this.B32[i][2]);
    this.geometry3[i].setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.lineControl3.push(new THREE.Line(this.geometry3[i], material));
    
    this.geometry4.push(new THREE.BufferGeometry());
    vertices.length = 0;
    vertices.push(this.B10[i][0], this.B10[i][1], this.B10[i][2]);
    vertices.push(this.B11[i][0], this.B11[i][1], this.B11[i][2]);
    vertices.push(this.B12[i][0], this.B12[i][1], this.B12[i][2]);
    vertices.push(this.B13[i][0], this.B13[i][1], this.B13[i][2]);
    this.geometry4[i].setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.lineControl4.push(new THREE.Line(this.geometry4[i], material));
    
    this.geometry5.push(new THREE.BufferGeometry());
    vertices.length = 0;
    vertices.push(this.B20[i][0], this.B20[i][1], this.B20[i][2]);
    vertices.push(this.B21[i][0], this.B21[i][1], this.B21[i][2]);
    vertices.push(this.B22[i][0], this.B22[i][1], this.B22[i][2]);
    vertices.push(this.B23[i][0], this.B23[i][1], this.B23[i][2]);
    this.geometry5[i].setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.lineControl5.push(new THREE.Line(this.geometry5[i], material));
  
    // this.scene.add(this.lineControl1[i]);
    // this.scene.add(this.lineControl2[i]);
    // this.scene.add(this.lineControl3[i]);
    // this.scene.add(this.lineControl4[i]);
    // this.scene.add(this.lineControl5[i]);
  }
  
  computeBezierSurfacePoint(uVal: number, wVal: number, i: number) {
    let u2, u3, w2, w3;
    u2 = uVal * uVal;
    u3 = uVal * u2;
    w2 = wVal * wVal;
    w3 = wVal * w2;
    
    // Need to note the following regarding THREE.js Matrix4.
    // When we set the matrix, we set it in row major order.
    // However, when we access the elements of this matrix, these are
    // returned in column major order.
    let matC = new THREE.Matrix4();
    matC.set(-1, 3, -3, 1, 3, -6, 3, 0, -3, 3, 0, 0, 1, 0, 0, 0);
    
    let matPx = new THREE.Matrix4();
    matPx.set(
      this.B00[i][0],
      this.B10[i][0],
      this.B20[i][0],
      this.B30[i][0],
      this.B01[i][0],
      this.B11[i][0],
      this.B21[i][0],
      this.B31[i][0],
      this.B02[i][0],
      this.B12[i][0],
      this.B22[i][0],
      this.B32[i][0],
      this.B03[i][0],
      this.B13[i][0],
      this.B23[i][0],
      this.B33[i][0]
    );
    
    let matPy = new THREE.Matrix4();
    matPy.set(
      this.B00[i][1],
      this.B10[i][1],
      this.B20[i][1],
      this.B30[i][1],
      this.B01[i][1],
      this.B11[i][1],
      this.B21[i][1],
      this.B31[i][1],
      this.B02[i][1],
      this.B12[i][1],
      this.B22[i][1],
      this.B32[i][1],
      this.B03[i][1],
      this.B13[i][1],
      this.B23[i][1],
      this.B33[i][1]
    );
    
    let matPz = new THREE.Matrix4();
    matPz.set(
      this.B00[i][2],
      this.B10[i][2],
      this.B20[i][2],
      this.B30[i][2],
      this.B01[i][2],
      this.B11[i][2],
      this.B21[i][2],
      this.B31[i][2],
      this.B02[i][2],
      this.B12[i][2],
      this.B22[i][2],
      this.B32[i][2],
      this.B03[i][2],
      this.B13[i][2],
      this.B23[i][2],
      this.B33[i][2]
    );
    
    let mat1x = new THREE.Matrix4();
    mat1x.multiplyMatrices(matC, matPx);
    
    let mat1y = new THREE.Matrix4();
    mat1y.multiplyMatrices(matC, matPy);
    
    let mat1z = new THREE.Matrix4();
    mat1z.multiplyMatrices(matC, matPz);
    
    let mat2x = new THREE.Matrix4();
    mat2x.multiplyMatrices(mat1x, matC);
    
    let mat2y = new THREE.Matrix4();
    mat2y.multiplyMatrices(mat1y, matC);
    
    let mat2z = new THREE.Matrix4();
    mat2z.multiplyMatrices(mat1z, matC);
    
    // We access the matrix elements in column major order.
    let ex = mat2x.elements;
    let w0x = ex[0] * w3 + ex[4] * w2 + ex[8] * wVal + ex[12];
    let w1x = ex[1] * w3 + ex[5] * w2 + ex[9] * wVal + ex[13];
    let w2x = ex[2] * w3 + ex[6] * w2 + ex[10] * wVal + ex[14];
    let w3x = ex[3] * w3 + ex[7] * w2 + ex[11] * wVal + ex[15];
    
    let ey = mat2y.elements;
    let w0y = ey[0] * w3 + ey[4] * w2 + ey[8] * wVal + ey[12];
    let w1y = ey[1] * w3 + ey[5] * w2 + ey[9] * wVal + ey[13];
    let w2y = ey[2] * w3 + ey[6] * w2 + ey[10] * wVal + ey[14];
    let w3y = ey[3] * w3 + ey[7] * w2 + ey[11] * wVal + ey[15];
    
    let ez = mat2z.elements;
    let w0z = ez[0] * w3 + ez[4] * w2 + ez[8] * wVal + ez[12];
    let w1z = ez[1] * w3 + ez[5] * w2 + ez[9] * wVal + ez[13];
    let w2z = ez[2] * w3 + ez[6] * w2 + ez[10] * wVal + ez[14];
    let w3z = ez[3] * w3 + ez[7] * w2 + ez[11] * wVal + ez[15];
    
    let qx = u3 * w0x + u2 * w1x + uVal * w2x + w3x;
    let qy = u3 * w0y + u2 * w1y + uVal * w2y + w3y;
    let qz = u3 * w0z + u2 * w1z + uVal * w2z + w3z;
    
    return {
      xVal: qx,
      yVal: qy,
      zVal: qz,
    };
  }
  
  computeBezierSurface() {
    for (let b1 = 0; b1 < 3; b1++) {
      this.setupGrid(b1);
    }
    
    this.surfacePoints.length = 0;
    let uVal, wVal;
    
    this.uvArray.length = 0;
    
    for (let b2 = 0; b2 < 3; b2++) {
      for (let j = 0; j <= this.noDivisions; ++j) {
        wVal = j * this.step;
        for (let i = 0; i <= this.noDivisions; ++i) {
          uVal = i * this.step;
          
          let pt = this.computeBezierSurfacePoint(uVal, wVal, b2);
          this.surfacePoints.push(pt.xVal, pt.yVal, pt.zVal);
          this.uvArray.push(1.0 - wVal);
          this.uvArray.push(uVal);
        }
      }
      this.renderSurface(b2);
    }
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  initializeValues() {
    this.B00 = [];
    this.B01 = [];
    this.B02 = [];
    this.B03 = [];
    this.B10 = [];
    this.B11 = [];
    this.B12 = [];
    this.B13 = [];
    this.B20 = [];
    this.B21 = [];
    this.B22 = [];
    this.B23 = [];
    this.B30 = [];
    this.B31 = [];
    this.B32 = [];
    this.B33 = [];
    
    //1
    this.B00.push([0, 6, 0]);
    this.B01.push([0, 3, 1.5]);
    this.B02.push([0, 2.5, 3]);
    this.B03.push([0, 2, 6]);
    
    this.B10.push([3, 3, 0]);
    this.B11.push([3, 2, 2.5]);
    this.B12.push([3, 2, 4]);
    this.B13.push([3, 3, 6]);
    
    this.B20.push([6, 2, 0]);
    this.B21.push([6, 3, 2.5]);
    this.B22.push([6, 3, 4]);
    this.B23.push([6, 2, 6]);
    
    this.B30.push([9, 0, 0]);
    this.B31.push([8.5, 2.5, 0.5]);
    this.B32.push([8.5, 2.5, 3.5]);
    this.B33.push([8, 1.5, 6]);
    
    //2
    this.B00.push([0, -6, 0]);
    this.B01.push([0, -3, 1.5]);
    this.B02.push([0, -2.5, 3]);
    this.B03.push([0, -2, 6]);
    
    this.B10.push([3, -3, 0]);
    this.B11.push([3, -2, 2.5]);
    this.B12.push([3, -2, 4]);
    this.B13.push([3, -3, 6]);
    
    this.B20.push([6, -2, 0]);
    this.B21.push([6, -3, 2.5]);
    this.B22.push([6, -3, 4]);
    this.B23.push([6, -2, 6]);
    
    this.B30.push(this.B30[0]);
    this.B31.push([8.5, -2.5, 0.5]);
    this.B32.push([8.5, -2.5, 3.5]);
    this.B33.push([8, -1.5, 6]);
    
    //3
    this.B00.push(this.B00[0]);
    this.B01.push([0, 1, 1]);
    this.B02.push([0, -1, 1]);
    this.B03.push(this.B00[1]);
  
    this.B10.push(this.B10[0]);
    this.B11.push([3, 1.5, 1]);
    this.B12.push([3, -1.5, 1]);
    this.B13.push(this.B10[1]);
  
    this.B20.push(this.B20[0]);
    this.B21.push([6, 1.5, 1]);
    this.B22.push([6, -1.5, 1]);
    this.B23.push(this.B20[1]);
  
    this.B30.push(this.B30[0]);
    this.B31.push(this.B30[0]);
    this.B32.push(this.B30[0]);
    this.B33.push(this.B30[0]);
    
    this.uValue = 0.5;
    this.wValue = 0.6;
    
    this.xAngle = 0;
    this.yAngle = 0;
    this.zAngle = 0;
    
    this.step = 1.0 / this.noDivisions;
    
    this.cameraAngle = 75;
    this.camRadius = 20;
    
    this.uvArray.length = 0;
  }
}

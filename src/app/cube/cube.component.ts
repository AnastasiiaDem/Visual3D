import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {NURBSSurface} from 'three/examples/jsm/curves/NURBSSurface';
import {ParametricGeometry} from 'three';

@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent implements OnInit, AfterViewInit {
  
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
  private camera!: THREE.PerspectiveCamera;
  private loader = new THREE.TextureLoader();
  private axesHelper = new THREE.AxesHelper( 600 );
  
  private light = new THREE.PointLight('#ffe945');

  private geometry = new THREE.TorusKnotGeometry(50, 10);
  private material = new THREE.MeshPhongMaterial({color: '#047cf4', emissive: '#0458f4'});
  // private material = new THREE.MeshBasicMaterial({map: this.loader.load(this.texture)});
  // private cube: THREE.Mesh = new THREE.Mesh(this.geometry, this.material);
  private cube = new THREE.Group();
  
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  
  private animateCube() {
    this.cube.rotation.x += this.rotationSpeedX;
    this.cube.rotation.y += this.rotationSpeedY;
  }
  
  init() {
    const nsControlPoints = [
      [
        new THREE.Vector3( - 200, - 200, 100 ),
        new THREE.Vector3( - 200, - 100, - 200),
        new THREE.Vector3( - 200, 100, 250),
        new THREE.Vector3( - 200, 200, - 100)
      ],
      [
        new THREE.Vector3( 0, - 200, 0),
        new THREE.Vector3( 0, - 100, - 100),
        new THREE.Vector3( 0, 100, 150),
        new THREE.Vector3( 0, 200, 0)
      ],
      [
        new THREE.Vector3( 200, - 200, - 100),
        new THREE.Vector3( 200, - 100, 200),
        new THREE.Vector3( 200, 100, - 250),
        new THREE.Vector3( 200, 200, 100)
      ],
      // [
      //   new THREE.Vector3( 100, - 100, - 200),
      //   new THREE.Vector3( 100, - 200, 100),
      //   new THREE.Vector3( 100, 200, - 150),
      //   new THREE.Vector3( 100, 100, 200)
      // ]
    ];
    const degree1 = 2;
    const degree2 = 3;
    const knots1 = [ 0, 0, 0, 1, 1, 1 ];
    const knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ];
    const nurbsSurface = new NURBSSurface( degree1, degree2, knots1, knots2, nsControlPoints );
    
    // const map = new THREE.TextureLoader().load( 'textures/uv_grid_opengl.jpg' );
    // map.wrapS = map.wrapT = THREE.RepeatWrapping;
    // map.anisotropy = 16;
    
    function getSurfacePoint( u: number, v: number, target: THREE.Vector3 ) {
      return nurbsSurface.getPoint( u, v, target );
    }
    
    const geometry = new ParametricGeometry( getSurfacePoint, 20, 20 );
    const material = new THREE.MeshLambertMaterial( { color: "#ff0000" } );
    const object = new THREE.Mesh( geometry, material );
    object.position.set( 0, 0, 0 );
    object.scale.multiplyScalar( 1 );
    this.cube.add( object );
  }
  
  private createScene() {
    //* Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#a9a9a9');
    this.light.position.set(200, 50, 200);
    this.scene.add(this.light);
    this.scene.add(this.cube);
    this.cube.translateOnAxis(new THREE.Vector3(0, 0, 0), 1);
    this.scene.add( this.axesHelper );
    
    //*Camera
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    );
    // this.camera.position.z = this.cameraZ;
    this.camera.up.set(0,0,1);
  
    // this.camera.position.y = this.cameraY;
    // this.camera.position.x = this.cameraX;
    this.camera.position.set(400,100,300);
    
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
    
    let component: CubeComponent = this;
    (function render() {
      requestAnimationFrame(render);
      // component.animateCube();
      component.renderer.render(component.scene, component.camera);
    }());
  }
  
  constructor() {
  }
  
  ngOnInit(): void {
  }
  
  ngAfterViewInit() {
    this.init();
    this.createScene();
    this.startRenderingLoop();
    this.createControls();
  }
  
}

import { engine, Transform } from "@dcl/sdk/ecs";
import { Color3, Color4, Quaternion, Vector3 } from "@dcl/sdk/math";

export const SCENE_ROTATION = 0

export const SCENE_CENTER = Vector3.create(8,0,8) 
export const SCENE_ROTATION_Y = 0

export let sceneParentEntity = engine.addEntity()
Transform.create(sceneParentEntity, { 
    position:Vector3.create(8,0,8),
    rotation: Quaternion.fromEulerDegrees(0, SCENE_ROTATION_Y,0)

})
export const GRAVITY = 4.9
export const SHOOT_FORCE = 7
export const FRUIT_PLANE_OFFSET = -6.5
export const BOARD_DECAL_PLANE_OFFSET = 0.85


//SFX ATTACH TO OBJECT
export let winSound = 'sounds/win.mp3'
export let loseSound = 'sounds/lose.mp3'

// export let _COLORS = [
//     'black', 'orange', 'blue', 'yellow', 'purple', 'red', 'green', 'magenta'
//   ];

// export let ColorCodeArray = [
//     '00000000', 
//     'ff7e31ff',
//     '0095daff',
//     'f7c518ff',
//     '9e67caff',
//     'e5166aff',
//     '00d79fff',
//     'ff24bfff'
// ]  

export const _FLYING_OBJECTS = [
{
    name: 'bomb',
    shape: "models/bomb.glb",
    subShapes:[
        "models/bomb_top.glb",        
        "models/bomb_bottom.glb",
    ],   
    color: Color4.fromHexString("#000000ff")
    
},
{
    name: 'tomato',
    shape: "models/vegetables/tomato.glb",
    subShapes:[
        "models/vegetables/tomato_top.glb",       
        "models/vegetables/tomato_bottom.glb", 
             
    ],    
    color: Color4.Red()
    
},
{
    name: 'lettuce',
    shape: "models/vegetables/lettuce.glb",
    subShapes:[
        "models/vegetables/lettuce_top.glb",
        "models/vegetables/lettuce_bottom.glb"
    ],   
    color: Color4.fromHexString("#8a9635ff")
    
},
{
    name: 'onion',
    shape: "models/vegetables/onion.glb",
    subShapes:[
        "models/vegetables/onion_top.glb",
        "models/vegetables/onion_bottom.glb"
    ],   
    color:  Color4.Purple()
    
},
{
    name: 'carrot',
    shape: "models/vegetables/carrot.glb",
    subShapes:[
        "models/vegetables/carrot_top.glb",
        "models/vegetables/carrot_bottom.glb"
    ],   
    color:  Color4.fromHexString('#ff9911ff')
    
},
{
    name: 'eggplant',
    shape: "models/vegetables/eggplant.glb",
    subShapes:[
        "models/vegetables/eggplant_top.glb",
        "models/vegetables/eggplant_bottom.glb"
    ],   
    color:  Color4.Purple()
    
},
{
    name: 'cheese',
    shape: "models/vegetables/cheese.glb",
    subShapes:[
        "models/vegetables/cheese_top.glb",
        "models/vegetables/cheese_bottom.glb"
    ],   
    color:  Color4.Yellow()
    
},
{
    name: 'pickle',
    shape: "models/vegetables/pickle.glb",
    subShapes:[
        "models/vegetables/pickle_top.glb",
        "models/vegetables/pickle_bottom.glb"
    ],   
    color:   Color4.fromHexString("#8abc35ff")
    
},

];

export function getRandomShapeID(vegetableOnly:boolean):number{       

    if(vegetableOnly){
        return Math.floor(1 + Math.random() * (_FLYING_OBJECTS.length - 1.5))
    }

    return Math.floor(Math.random() * (_FLYING_OBJECTS.length - 0.5))
}


// default
export let material ={
    albedoColor: Color4.Yellow(),
    emissiveColor: Color3.Yellow(),
    emissiveIntensity: 2,
    transparencyMode: 2,
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}



//Black 
export let matBlack ={
    albedoColor: Color4.Black(),           
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}      

//Green
export let matGreen ={
    albedoColor: Color4.Green(),   
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}


//yellow
export let matYellow ={
    albedoColor: Color4.fromHexString("#FF9900FF"),
    emissiveColor:  Color3.fromHexString("#FF9900"),
    emissiveIntensity: 1,           
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}        

//Red 
export let matRed ={
    albedoColor: Color4.Red(),
    emissiveColor: Color3.Red(),
    emissiveIntensity: 1,            
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}


//White 
export let matWhite ={
    albedoColor: Color4.Gray(),
    emissiveColor: Color3.Gray(),
    emissiveIntensity: 1,            
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}       

 

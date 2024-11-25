import { EasingFunction, engine, Entity, Material, MaterialTransparencyMode, MeshRenderer, Schemas, Transform, Tween } from "@dcl/sdk/ecs";
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math";
import * as utils from "@dcl-sdk/utils"
import { parentEntity, syncEntity } from "@dcl/sdk/network";

export const SplatDecal = engine.defineComponent('splat-decal', { 
    
    active:Schemas.Boolean,    
    transparency:Schemas.Number,
    color:Schemas.Color4,
    elapsedTime:Schemas.Number
    
})

export const Splash = engine.defineComponent('splash', { 
    
    active:Schemas.Boolean,    
    transparency:Schemas.Number,
    color:Schemas.Color4,
    elapsedTime:Schemas.Number,
    duration:Schemas.Number
    
})

export class SplashSpawner {
    splashPool:Entity[]
    maxCount:number = 8
    hidePos:Vector3 = Vector3.create(8,-10,8)
    currentIndex:number = 0

    constructor(parent:Entity){

        this.splashPool = []

        for(let i=0; i< this.maxCount; i++){
            let splash = engine.addEntity()
            Transform.create(splash,
               { 
                position: Vector3.create(this.hidePos.x, this.hidePos.y, this.hidePos.z),
                parent: parent,               
                rotation: Quaternion.fromEulerDegrees(0,0,Math.random()*180) ,                
                scale: Vector3.create(0.1,0.1,0.1)        
               }
            )
            MeshRenderer.setPlane(splash)
            Splash.create(splash,{
                active: true,
                transparency: 0,
                color: Color4.White(),
                elapsedTime:0,
                duration: 0.3
            })
            Material.setPbrMaterial(splash, {
                albedoColor:Color4.White(),
                //transparencyMode:MaterialTransparencyMode.MTM_ALPHA_TEST,
                //alphaTexture:Material.Texture.Common( {src: "images/splash.png"}),
                texture:Material.Texture.Common( {src: "images/splash.png"}) ,
                castShadows: false              
            })
            this.splashPool.push(splash)
        }
    }

    getNewSplash():Entity{

        this.currentIndex ++
        if(this.currentIndex >= this.splashPool.length){
            this.currentIndex = 0            
        }

        return this.splashPool[this.currentIndex]
    }

    spawnSplash(pos:Vector3, rot:Quaternion, parent:Entity,  color:Color4){

        let splash = this.getNewSplash()
        Transform.createOrReplace(splash,
           { 
            position: pos,
            parent: parent,
           // rotation: Quaternion.multiply(rot, Quaternion.fromEulerDegrees(90,0,0)) ,
            rotation: Quaternion.fromEulerDegrees(0,0,Math.random()*180) ,
            //scale: Vector3.scale(Vector3.One(), 2 + Math.random()*1.5)
            scale: Vector3.create(1,1,1)
    
           }
        )     
       let splashInfo = Splash.getMutable(splash)        
       splashInfo.active = true
       splashInfo.transparency = 0.1
       splashInfo.color = color
       splashInfo.elapsedTime = 0
       splashInfo.duration = 0.3     
       
    //    utils.tweens.startScaling(
    //     splash,
    //     Vector3.create(0.1, 0.1, 0.1),
    //     Vector3.create(1, 7, 1),
    //     splashInfo.duration,
    //     utils.InterpolationType.EASEOUTQUAD

    //     )

    // Tween.createOrReplace(
    //     splash,
    //     {
    //         duration:500,
    //         mode: Tween.Mode.Scale({
    //             start: Vector3.create(0.1, 0.1, 0.11),
    //             end: Vector3.create(4, 8, 4),
    //           }),
    //         playing:true,
    //         easingFunction: EasingFunction.EF_EASEINSINE,

    //     }

    // )
    }
}

export class SplatDecalSpawner {
    splatPool:Entity[]
    maxCount:number = 10
    hidePos:Vector3 = Vector3.create(8,-10,8)
    currentIndex:number = 0

    constructor(parent:Entity){

        this.splatPool = []

        for(let i=0; i< this.maxCount; i++){
            let splat = engine.addEntity()
        Transform.create(splat,
        { 
            position: Vector3.create(this.hidePos.x, this.hidePos.y, this.hidePos.z),
            parent: parent,
            rotation:Quaternion.fromEulerDegrees(0,0,Math.random()*360),
            scale: Vector3.scale(Vector3.create(0.5+Math.random(), 0.5 + Math.random(),1), 2 + Math.random()*1.5)

        }
        )
        MeshRenderer.setPlane(splat)
        SplatDecal.create(splat,{
            active: true,
            transparency: 0,
            color: Color4.Red(),
            elapsedTime:0
        })
        Material.setPbrMaterial(splat, {
            albedoColor: Color4.Red(),
            transparencyMode:MaterialTransparencyMode.MTM_ALPHA_BLEND,
            alphaTexture:Material.Texture.Common( {src: "images/splat.png"}),
            texture:Material.Texture.Common( {src: "images/splat.png"}),
            castShadows: false 
        // alphaTest: 0.1
            
        })
        //parentEntity(splat,parent)
        //syncEntity(splat, [Transform.componentId, Material.componentId])
            this.splatPool.push(splat)
        }
    }

    getNewSplat():Entity{

        this.currentIndex ++
        if(this.currentIndex >= this.splatPool.length){
            this.currentIndex = 0            
        }

        return this.splatPool[this.currentIndex]
    }

    spawnSplat(pos:Vector3, parent:Entity,  color:Color4){

        let splat = this.getNewSplat()
        Transform.createOrReplace(splat,
           { 
            position: pos,
            parent: parent,
            rotation:Quaternion.fromEulerDegrees(0,0,Math.random()*360),
            scale: Vector3.scale(Vector3.create(0.5+Math.random(), 0.5 + Math.random(),1), 2 + Math.random()*1.5)
    
           }
        )     
       let splatInfo = SplatDecal.getMutable(splat)        
       splatInfo.active = true,
       splatInfo.transparency= 0.01,
       splatInfo.color = color,
       splatInfo.elapsedTime = 0  
       
       Material.setPbrMaterial(splat, {
        albedoColor:color,
        transparencyMode:MaterialTransparencyMode.MTM_ALPHA_BLEND,
        alphaTexture:Material.Texture.Common( {src: "images/splat.png"}),
        texture:Material.Texture.Common( {src: "images/splat.png"}),
        castShadows: false 
       // alphaTest: 0.1
        
    })
       
    }
}


export function splatSystem(dt:number){

    //SPLAT DECALS ON WALL
    const decalGroup = engine.getEntitiesWith(SplatDecal, Transform) 

    for (const [decal] of decalGroup){

        const decalInfo = SplatDecal.getMutable(decal)

        if(decalInfo.active){
            const transform = Transform.getMutable(decal)

            // transform.scale = Vector3.scale(transform.scale, 0.9*dt)

            decalInfo.elapsedTime +=dt
            
            
            if(decalInfo.elapsedTime > 1)
            {
            transform.position.y -= 0.1*dt
            transform.scale.y += 0.2*dt
            decalInfo.transparency += 0.7*dt

            Material.setPbrMaterial(decal, {
                albedoColor:Color4.create( decalInfo.color.r, decalInfo.color.g, decalInfo.color.b, 1-decalInfo.transparency ),
                transparencyMode:MaterialTransparencyMode.MTM_ALPHA_BLEND,
                alphaTexture:Material.Texture.Common( {src: "images/splat.png"}),
                texture:Material.Texture.Common( {src: "images/splat.png"}),
                castShadows: false 
                //alphaTest:0.3 + decalInfo.transparency                      
                
            })

            if(decalInfo.transparency > 1){
                //engine.removeEntity(decal)
                transform.position.y = -10
                decalInfo.active = false
            }
            }

            
        }
    }

    //SLICING SPLASH PLANES
    const splashGroup = engine.getEntitiesWith(Splash, Transform) 

    for (const [splash] of splashGroup){

        const splashInfo = Splash.getMutable(splash)

        if(splashInfo.active){
            const transform = Transform.getMutable(splash)

            // transform.scale = Vector3.scale(transform.scale, 0.9*dt)

            splashInfo.elapsedTime +=dt          
             
            let animFactor = splashInfo.elapsedTime/splashInfo.duration

            //transform.position.y -= 0.1*dt
           // transform.scale = Vector3.lerp(Vector3.create(0.1, 0.1, 0.1), Vector3.create(2, 2, 1), animFactor)

           
            transform.scale.x+= 10*dt
            transform.scale.y+= 5*dt           
            splashInfo.transparency  =  animFactor

            Material.setPbrMaterial(splash, {
                albedoColor:splashInfo.color,
                transparencyMode:MaterialTransparencyMode.MTM_ALPHA_TEST,
                alphaTexture:Material.Texture.Common( {src: "images/splash.png"}),
                texture:Material.Texture.Common( {src: "images/splash.png"}),
                alphaTest:0.3 + splashInfo.transparency,
                emissiveColor:splashInfo.color,
                emissiveTexture: Material.Texture.Common( {src: "images/splash.png"}),
                emissiveIntensity:2- animFactor*2
                                 
                
            })

            if(splashInfo.transparency > 1){
                //engine.removeEntity(splash)
                transform.position.y = -10
                splashInfo.active = false
                Tween.deleteFrom(splash)
            }
            

            
        }
    }
}
import { AudioSource, engine, Entity, Transform } from "@dcl/sdk/ecs";
import { Vector3 } from "@dcl/sdk/math";

export class MusicPlayer {
    musicEntity:Entity

    constructor(){
        this.musicEntity = engine.addEntity()
        Transform.create(this.musicEntity, {
            position: Vector3.Zero(),
            parent: engine.CameraEntity
        })

        AudioSource.createOrReplace(this.musicEntity, {
            audioClipUrl: "sounds/music.mp3",
            global:true,
            loop:true,
            playing:false,
            volume:0.5
        })
    }

    playMusic(){
        if(!AudioSource.get(this.musicEntity).playing){
            AudioSource.getMutable(this.musicEntity).playing = true
            AudioSource.getMutable(this.musicEntity).loop = true
        }
       
    }
    stopMusic(){
        if(AudioSource.get(this.musicEntity).playing){
            AudioSource.getMutable(this.musicEntity).playing = false
        }
        
    }

    toggleMusic(){

        if(AudioSource.get(this.musicEntity).playing){
            this.stopMusic()
        }
        else{
            this.playMusic()
        }
    }
}   

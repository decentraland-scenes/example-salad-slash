import { engine, Schemas } from "@dcl/sdk/ecs";
import { SCENE_CENTER } from "./globals";

export enum GAME_STATE {
    IDLE,   
    MAIN_LOOP,
    SHOW_SCORE
    
}



export const GameStateData = engine.defineComponent('game-state-data', {    
    //cells:Schemas.Array(Schemas.Array(Schemas.Entity)),
   // state:Schemas.EnumNumber<GRID_STATE>(GRID_STATE, GRID_STATE.IDLE),
    gameTime:Schemas.Number,
    elapsedTime:Schemas.Number,
    roundTime:Schemas.Number,   
    sfxOn:Schemas.Boolean,    
    currentLevel:Schemas.Number,     
    maxLevel:Schemas.Number,
    currentSpeed:Schemas.Number,
    lives:Schemas.Number,
    state:Schemas.EnumNumber<GAME_STATE>(GAME_STATE, GAME_STATE.MAIN_LOOP),
    score:Schemas.Number

})
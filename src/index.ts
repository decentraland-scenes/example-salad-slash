import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { Game, gameStateEntity } from './game'
import { AudioSource, engine } from '@dcl/sdk/ecs'

import { isStateSyncronized, syncEntity } from '@dcl/sdk/network'
import playersApi, { getPlayer } from '@dcl/sdk/players'
import { addEnvironment } from './environment'
import { GameStateData } from './gameState'

import { SCENE_ROTATION, sceneParentEntity } from './globals'
import { startTweenSystem } from './tweenSystem'
import { addHideArea, unlockPlayer } from './lockPlayer'


//export const multiPlayer = true



export function main() {
 
  let game = new Game()
  //game.newGame()
  addEnvironment(sceneParentEntity)
  startTweenSystem()
  addHideArea()
  
}



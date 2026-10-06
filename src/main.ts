import './style.css'
import './menu/menu.css'
import { BadmintonPrototype } from './badminton/BadmintonPrototype.ts'
import { PingpongPrototype } from './pingpong/PingpongPrototype.ts'
import { Game } from './core/Game.ts'
import { GameState, Screen } from './core/GameState.ts'
import { MenuManager } from './menu/MenuManager.ts'

const root = document.querySelector<HTMLElement>('#app')
if (!root) throw new Error('Element #app tidak ditemukan pada index.html')

const viewport = document.createElement('div')
viewport.className = 'viewport'
root.append(viewport)

const uiLayer = document.createElement('div')
uiLayer.className = 'ui-layer'
root.append(uiLayer)

const game = new Game(viewport)
const state = new GameState()
export const menu = new MenuManager(uiLayer, state)
const badminton = new BadmintonPrototype(game)
const pingpong = new PingpongPrototype(game)

state.onChange((screen) => {
  const inArena = screen === Screen.Badminton
  const inPingpongArena = screen === Screen.Pingpong
  badminton.setActive(inArena)
  pingpong.setActive(inPingpongArena)
  uiLayer.hidden = inArena
  uiLayer.hidden = inArena || inPingpongArena
})

game.start()

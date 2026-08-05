type AppState = {
    isReady: boolean;
    isDBReady: boolean;
    isShuttingDown: boolean
}
const appState: AppState = {
    isReady: false,
    isDBReady:false,
    isShuttingDown: false
}
export default appState;

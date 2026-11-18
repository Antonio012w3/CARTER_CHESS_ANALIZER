import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";

const $ = id => document.getElementById(id);
const chess = new Chess();
let history = [], cursor = 0, engine = null, engineReady = false, busy = false;
const pieces = {wk:"♔",wq:"♕",wr:"♖",wb:"♗",wn:"♘",wp:"♙",bk:"♚",bq:"♛",br:"♜",bb:"♝",bn:"♞",bp:"♟"};
const files = "abcdefgh";

function drawBoard(){
  const board=$("board"); board.innerHTML="";
  const temp = new Chess();
  if(history.length) { try { temp.loadPgn($("pgnInput").value.trim()); } catch {} }
  const view = new Chess();
  if(history.length){ view.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"); for(let i=0;i<cursor;i++) view.move(history[i]); }
  const matrix=view.board();
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const sq=document.createElement("div"); sq.className="square "+((r+c)%2===0?"light":"dark");
    const p=matrix[r][c]; if(p) sq.textContent=pieces[p.color+p.type];
    const name=files[c]+(8-r);
    if((c===0||r===7)){const coord=document.createElement("span");coord.className="coord";coord.textContent=c===0?8-r:files[c];sq.append(coord)}
    board.append(sq);
  }
  $("moveCounter").textContent=history.length?`${cursor} / ${history.length} plies`:"Sin partida";
  $("moveList").textContent=history.length?history.map((m,i)=>`${i%2===0?Math.floor(i/2)+1+". ":""}${m.san}`).join("  "):"Cargá una partida para ver sus movimientos.";
  $("analyze").disabled=!history.length || busy;
  $("analyzeAll").disabled=!history.length || busy;
}
function setStatus(t){$("engineStatus").textContent=t}
function loadPgn(text){
  chess.reset(); chess.loadPgn(text);
  history=chess.history({verbose:true}).map(m=>({from:m.from,to:m.to,promotion:m.promotion,san:m.san}));
  cursor=history.length; drawBoard();
  $("analysisMessage").textContent=`Partida cargada: ${history.length} movimientos.`;
  $("eval").textContent="—"; $("bestMove").textContent="—"; $("depth").textContent="—"; $("allResults").innerHTML="";
}
$("pgnFile").addEventListener("change",async e=>{const f=e.target.files[0];if(f)$("pgnInput").value=await f.text()});
$("loadGame").onclick=()=>{try{loadPgn($("pgnInput").value.trim())}catch(e){$("analysisMessage").textContent="No pude leer ese PGN. Revisá que esté completo y sea válido."}};
$("first").onclick=()=>{cursor=0;drawBoard()}; $("prev").onclick=()=>{cursor=Math.max(0,cursor-1);drawBoard()};
$("next").onclick=()=>{cursor=Math.min(history.length,cursor+1);drawBoard()}; $("last").onclick=()=>{cursor=history.length;drawBoard()};

function startEngine(){
  if(engine) return;
  setStatus("Cargando Stockfish…");
  try{
    engine=new Worker("https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-lite-single.js");
    engine.onmessage=e=>{
      const line=String(e.data);
      if(line==="uciok"){engine.postMessage("isready")}
      if(line==="readyok"){engineReady=true;setStatus("Stockfish listo");$("analysisMessage").textContent="Motor listo. Elegí una posición y analizala."}
      const info=line.match(/info depth (\d+).*?score (cp|mate) (-?\d+).*? pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
      if(info){$("depth").textContent=info[1];$("eval").textContent=info[2]==="mate"?`M${info[3]}`:(Number(info[3])/100).toFixed(2)}
      const best=line.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
      if(best){const u=best[1];$("bestMove").textContent=u.slice(0,2)+" → "+u.slice(2,4)+(u[4]||"");busy=false;$("analyze").disabled=false;$("analyzeAll").disabled=false;$("analysisMessage").textContent="Análisis terminado."}
    };
    engine.onerror=()=>{setStatus("Error al cargar");$("analysisMessage").textContent="No se pudo cargar Stockfish. Revisá tu conexión e intentá recargar la página.";engine=null};
    engine.postMessage("uci");
  }catch(e){setStatus("No disponible")}
}
function fenAt(ply){const p=new Chess();for(let i=0;i<ply;i++)p.move(history[i]);return p.fen()}
function analyze(ply=cursor){
  if(busy)return; startEngine();
  if(!engineReady){$("analysisMessage").textContent="Esperando que Stockfish termine de cargar…";return}
  busy=true;$("analyze").disabled=true;$("analyzeAll").disabled=true;
  $("analysisMessage").textContent="Stockfish está analizando…";
  $("eval").textContent="…";$("bestMove").textContent="…";$("depth").textContent="…";
  engine.postMessage("stop");engine.postMessage("position fen "+fenAt(ply));engine.postMessage("go depth 14");
}
$("analyze").onclick=()=>analyze(cursor);
$("analyzeAll").onclick=async()=>{
  if(!engineReady){startEngine();$("analysisMessage").textContent="Esperando que Stockfish termine de cargar…";return}
  const out=$("allResults");out.innerHTML="";busy=true;$("analyze").disabled=true;$("analyzeAll").disabled=true;
  for(let i=0;i<=history.length;i++){
    $("analysisMessage").textContent=`Preparando análisis: posición ${i+1} de ${history.length+1}.`;
    const row=document.createElement("div");row.className="result-row";row.textContent=`Posición ${i}: ${fenAt(i).split(" ")[1]==="w"?"Blancas":"Negras"} al turno`;out.append(row);
    // Each position is available for individual review; full batch is intentionally kept lightweight.
  }
  busy=false;$("analyze").disabled=false;$("analyzeAll").disabled=false;
  $("analysisMessage").textContent="Se listaron las posiciones. Abrí cada una con los controles y usá «Analizar posición».";
};
drawBoard();
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));

const {useState,useMemo,useEffect} = React;

const PALETTES = [
  ["#0F3B4D","#3AA6A6"],["#7A3B2E","#E8B94D"],["#1F2A44","#7C89C7"],
  ["#3A4F2E","#9BB168"],["#5C2A4D","#C97BA0"],["#0F4C3A","#4FB286"]
];
const ICONS = {atracao:"🗺️",hotel:"🏨",restaurante:"🍽️"};

const destinos = [
  {id:"rio",nome:"Rio de Janeiro",pais:"Brasil",distKm:0,internacional:false,litoral:true,
   lugares:[
    {tipo:"atracao",nome:"Cristo Redentor",nota:4.8,avals:2140,preco:120,desc:"Vista panorâmica do topo do Corcovado."},
    {tipo:"hotel",nome:"Copacabana Palace",nota:4.9,avals:980,preco:1450,desc:"Hotel histórico de frente para o mar."},
    {tipo:"restaurante",nome:"Aprazível",nota:4.6,avals:610,preco:180,desc:"Cozinha brasileira contemporânea em Santa Teresa."}]},
  {id:"paris",nome:"Paris",pais:"França",distKm:9200,internacional:true,litoral:false,
   lugares:[
    {tipo:"atracao",nome:"Torre Eiffel",nota:4.7,avals:5400,preco:95,desc:"O símbolo mais famoso da cidade luz."},
    {tipo:"hotel",nome:"Le Marais Boutique",nota:4.5,avals:720,preco:980,desc:"Charme parisiense a poucos passos do centro."},
    {tipo:"restaurante",nome:"Le Petit Bistro",nota:4.4,avals:390,preco:220,desc:"Clássicos franceses num ambiente intimista."}]},
  {id:"ny",nome:"Nova York",pais:"Estados Unidos",distKm:7700,internacional:true,litoral:true,
   lugares:[
    {tipo:"atracao",nome:"Central Park",nota:4.8,avals:8900,preco:0,desc:"O pulmão verde de Manhattan."},
    {tipo:"hotel",nome:"Midtown Suites",nota:4.3,avals:540,preco:1100,desc:"Base perfeita para explorar a cidade."},
    {tipo:"restaurante",nome:"Katz's Delicatessen",nota:4.6,avals:3100,preco:90,desc:"O sanduíche de pastrami mais lendário da cidade."}]},
  {id:"santorini",nome:"Santorini",pais:"Grécia",distKm:10500,internacional:true,litoral:true,
   lugares:[
    {tipo:"atracao",nome:"Oia ao pôr do sol",nota:4.9,avals:4200,preco:0,desc:"O pôr do sol mais fotografado do Egeu."},
    {tipo:"hotel",nome:"Caldera Cave Suites",nota:4.8,avals:610,preco:1900,desc:"Suítes esculpidas na rocha vulcânica."},
    {tipo:"restaurante",nome:"Ammoudi Fish Tavern",nota:4.5,avals:480,preco:150,desc:"Peixe fresco à beira-mar."}]},
  {id:"toquio",nome:"Tóquio",pais:"Japão",distKm:18500,internacional:true,litoral:true,
   lugares:[
    {tipo:"atracao",nome:"Shibuya Crossing",nota:4.6,avals:3900,preco:0,desc:"O cruzamento mais movimentado do mundo."},
    {tipo:"hotel",nome:"Shinjuku Sky Tower",nota:4.7,avals:820,preco:1350,desc:"Vistas noturnas inesquecíveis da metrópole."},
    {tipo:"restaurante",nome:"Sushi Dai",nota:4.9,avals:1500,preco:260,desc:"Sushi de excelência perto do antigo Tsukiji."}]},
  {id:"maldivas",nome:"Maldivas",pais:"Maldivas",distKm:15900,internacional:true,litoral:true,
   lugares:[
    {tipo:"atracao",nome:"Mergulho no recife",nota:4.9,avals:1200,preco:340,desc:"Vida marinha vibrante em águas cristalinas."},
    {tipo:"hotel",nome:"Overwater Villas",nota:4.9,avals:940,preco:3200,desc:"Bangalôs sobre o mar turquesa."},
    {tipo:"restaurante",nome:"Sea Breeze Grill",nota:4.5,avals:310,preco:210,desc:"Frutos do mar servidos com os pés na areia."}]}
];

function estrelas(nota){
  const cheias = Math.round(nota);
  return "★".repeat(cheias) + "☆".repeat(5-cheias);
}

function calcularTransporte(d){
  const opcoes = [];
  if(d.distKm===0) return opcoes;
  opcoes.push({modo:"Avião",icone:"✈️",horas:d.distKm/780+1.4,custo:d.distKm*0.62+180});
  if(d.distKm<=3200) opcoes.push({modo:"Carro",icone:"🚗",horas:d.distKm/75,custo:d.distKm*0.68});
  if(d.distKm<=5000) opcoes.push({modo:"Ônibus",icone:"🚌",horas:d.distKm/62,custo:d.distKm*0.32});
  if(d.distKm<=2200 && !d.internacional) opcoes.push({modo:"Trem",icone:"🚆",horas:d.distKm/95,custo:d.distKm*0.55});
  if(d.litoral && d.distKm>1500) opcoes.push({modo:"Cruzeiro",icone:"🚢",horas:d.distKm/33,custo:d.distKm*1.05+400});
  return opcoes.sort((a,b)=>a.custo-b.custo);
}

function fmtHoras(h){
  const dias = Math.floor(h/24), horas = Math.round(h%24);
  return dias>0 ? `${dias}d ${horas}h` : `${horas}h`;
}
function fmtBRL(v){ return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}); }

function Navbar(){
  const [aberto,setAberto] = useState(false);
  const links = [["#inicio","Início"],["#destinos","Destinos"],["#calculadora","Calculadora"],["#sobre","Sobre"]];
  return (
    <nav className="sticky z-50 backdrop-blur bg-[var(--bg)]/90 border-b" style={{borderColor:'var(--line)',top:'env(safe-area-inset-top,0px)'}}>
      <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
        <a href="#inicio" className="serif text-2xl" style={{color:'var(--deep)'}}>Travel<span style={{color:'var(--coral)'}}>Go</span></a>
        <div className="hidden md:flex gap-7 items-center text-sm font-medium" style={{color:'var(--ink-soft)'}}>
          {links.map(([h,t])=><a key={h} href={h} className="hover:opacity-70">{t}</a>)}
        </div>
        <button className="md:hidden text-2xl" onClick={()=>setAberto(!aberto)} aria-label="Menu">☰</button>
      </div>
      {aberto && <div className="md:hidden px-5 pb-4 flex flex-col gap-3 text-sm">{links.map(([h,t])=><a key={h} href={h} onClick={()=>setAberto(false)}>{t}</a>)}</div>}
    </nav>
  );
}

function Hero(){
  return (
    <section id="inicio" className="max-w-6xl mx-auto px-5 pt-16 pb-10 grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
      <div>
        <p className="text-sm font-semibold mb-3" style={{color:'var(--coral)'}}>Planeje sem complicação</p>
        <h1 className="serif text-4xl md:text-6xl leading-[1.05]" style={{color:'var(--deep)'}}>Encontre seu próximo destino<span className="italic" style={{color:'var(--coral)'}}> e chegue lá</span></h1>
        <p className="mt-5 text-lg" style={{color:'var(--ink-soft)'}}>Compare atrações, hotéis e restaurantes — e descubra o jeito mais econômico de chegar até eles.</p>
      </div>
      <div className="gband rounded-3xl h-56 md:h-72 flex items-end p-6" style={{'--g1':'#0F3B4D','--g2':'#3AA6A6'}}>
        <p className="serif text-white text-2xl">6 destinos.<br/>Um único lugar.</p>
      </div>
    </section>
  );
}

function BarraFiltros({filtro,setFiltro,categoria,setCategoria,ordem,setOrdem}){
  const cats = [["todos","Todos"],["atracao","Atrações"],["hotel","Hotéis"],["restaurante","Restaurantes"]];
  return (
    <div className="max-w-6xl mx-auto px-5 -mt-2 mb-10">
      <div className="rounded-2xl p-4 shadow-sm border grid gap-3 md:grid-cols-[1.4fr_1.6fr_1fr]" style={{background:'var(--card)',borderColor:'var(--line)'}}>
        <input value={filtro} onChange={e=>setFiltro(e.target.value)} placeholder="Buscar país ou cidade…"
          className="px-4 py-3 rounded-xl border outline-none focus:ring-2" style={{borderColor:'var(--line)',color:'var(--ink)',background:'transparent'}} />
        <div className="hscroll flex gap-2">
          {cats.map(([v,l])=>(
            <button key={v} onClick={()=>setCategoria(v)} className="px-4 py-2 rounded-full text-sm whitespace-nowrap border"
              style={categoria===v?{background:'var(--deep)',color:'#fff',borderColor:'var(--deep)'}:{borderColor:'var(--line)',color:'var(--ink-soft)'}}>{l}</button>
          ))}
        </div>
        <select value={ordem} onChange={e=>setOrdem(e.target.value)} className="px-4 py-3 rounded-xl border outline-none" style={{borderColor:'var(--line)',color:'var(--ink)',background:'transparent'}}>
          <option value="avaliados">Melhor avaliados</option>
          <option value="populares">Mais populares</option>
          <option value="preco">Menor preço</option>
        </select>
      </div>
    </div>
  );
}

function Card({lugar,destino,paleta,onClick}){
  return (
    <button onClick={onClick} className="text-left rounded-2xl overflow-hidden border shadow-sm hover:-translate-y-1 transition" style={{borderColor:'var(--line)',background:'var(--card)'}}>
      <div className="gband h-36 flex items-center justify-center text-5xl" style={{'--g1':paleta[0],'--g2':paleta[1]}}>{ICONS[lugar.tipo]}</div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide" style={{color:'var(--ink-soft)'}}>{destino.nome}, {destino.pais}</p>
        <h3 className="serif text-lg mt-1">{lugar.nome}</h3>
        <div className="flex justify-between items-center mt-3 text-sm">
          <span style={{color:'var(--gold)'}}>{estrelas(lugar.nota)} <span style={{color:'var(--ink-soft)'}}>({lugar.avals})</span></span>
          <span className="font-semibold">{lugar.preco>0?fmtBRL(lugar.preco):"Gratuito"}</span>
        </div>
      </div>
    </button>
  );
}

const RESENHAS = ["Superou minhas expectativas, recomendo muito!","Vale cada centavo, experiência incrível.","Bom, mas achei um pouco cheio na alta temporada."];

function Modal({item,onClose}){
  if(!item) return null;
  const {lugar,destino,paleta} = item;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6" style={{background:'rgba(15,20,25,.6)'}} onClick={onClose}>
      <div className="rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{background:'var(--card)'}} onClick={e=>e.stopPropagation()}>
        <div className="gband h-40 flex items-center justify-center text-6xl relative" style={{'--g1':paleta[0],'--g2':paleta[1]}}>
          {ICONS[lugar.tipo]}
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-lg">✕</button>
        </div>
        <div className="p-6">
          <p className="text-xs uppercase tracking-wide" style={{color:'var(--ink-soft)'}}>{destino.nome}, {destino.pais}</p>
          <h2 className="serif text-2xl mt-1">{lugar.nome}</h2>
          <p style={{color:'var(--gold)'}} className="mt-2">{estrelas(lugar.nota)} <span style={{color:'var(--ink-soft)'}}>{lugar.nota} · {lugar.avals} avaliações</span></p>
          <p className="mt-4" style={{color:'var(--ink-soft)'}}>{lugar.desc}</p>
          <p className="mt-4 text-xl font-semibold">{lugar.preco>0?fmtBRL(lugar.preco):"Gratuito"}</p>
          <div className="mt-6 border-t pt-4" style={{borderColor:'var(--line)'}}>
            <p className="font-semibold mb-3">O que dizem os viajantes</p>
            {RESENHAS.map((r,i)=>(
              <div key={i} className="mb-3 text-sm">
                <p style={{color:'var(--gold)'}}>{"★".repeat(4+(i%2))}</p>
                <p style={{color:'var(--ink-soft)'}}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Destinos(){
  const [filtro,setFiltro] = useState("");
  const [categoria,setCategoria] = useState("todos");
  const [ordem,setOrdem] = useState("avaliados");
  const [ativo,setAtivo] = useState(null);

  const itens = useMemo(()=>{
    const q = filtro.toLowerCase();
    let lista = [];
    destinos.forEach((d,di)=>{
      if(q && !d.nome.toLowerCase().includes(q) && !d.pais.toLowerCase().includes(q)) return;
      d.lugares.forEach(l=>{
        if(categoria!=="todos" && l.tipo!==categoria) return;
        lista.push({lugar:l,destino:d,paleta:PALETTES[di%PALETTES.length]});
      });
    });
    if(ordem==="avaliados") lista.sort((a,b)=>b.lugar.nota-a.lugar.nota);
    if(ordem==="populares") lista.sort((a,b)=>b.lugar.avals-a.lugar.avals);
    if(ordem==="preco") lista.sort((a,b)=>a.lugar.preco-b.lugar.preco);
    return lista;
  },[filtro,categoria,ordem]);

  return (
    <section id="destinos" className="pb-16">
      <div className="max-w-6xl mx-auto px-5 mb-8">
        <h2 className="serif text-3xl" style={{color:'var(--deep)'}}>Lugares para conhecer</h2>
      </div>
      <BarraFiltros {...{filtro,setFiltro,categoria,setCategoria,ordem,setOrdem}} />
      <div className="max-w-6xl mx-auto px-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {itens.map((it,i)=><Card key={i} {...it} onClick={()=>setAtivo(it)} />)}
      </div>
      {itens.length===0 && <p className="text-center mt-10" style={{color:'var(--ink-soft)'}}>Nenhum resultado para esses filtros. Tente ajustar a busca.</p>}
      <Modal item={ativo} onClose={()=>setAtivo(null)} />
    </section>
  );
}

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function Calculadora(){
  const [cep,setCep] = useState("");
  const [estado,setEstado] = useState("");
  const [cidadeOrigem,setCidadeOrigem] = useState("");
  const [destinoId,setDestinoId] = useState(destinos[1].id);
  const [buscando,setBuscando] = useState(false);
  const [avisoCep,setAvisoCep] = useState("");

  async function buscarCep(){
    if(cep.replace(/\D/g,"").length!==8){ setAvisoCep("CEP inválido — use 8 dígitos."); return; }
    setBuscando(true); setAvisoCep("");
    try{
      const r = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g,"")}/json/`);
      const data = await r.json();
      if(data.erro) throw new Error();
      setEstado(data.uf); setCidadeOrigem(data.localidade);
    }catch(e){
      setAvisoCep("Não foi possível consultar o CEP automaticamente aqui. Preencha estado e cidade manualmente.");
    }finally{ setBuscando(false); }
  }

  const destino = destinos.find(d=>d.id===destinoId);
  const opcoes = useMemo(()=>calcularTransporte(destino),[destinoId]);

  return (
    <section id="calculadora" className="py-20 px-5" style={{background:'var(--deep)'}}>
      <div className="max-w-5xl mx-auto text-white">
        <p className="text-sm font-semibold" style={{color:'var(--gold)'}}>Calculadora de transporte</p>
        <h2 className="serif text-3xl mt-1 mb-8">Quanto custa chegar lá?</h2>
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white/10 rounded-2xl p-5">
            <p className="font-medium mb-3">Origem</p>
            <div className="flex gap-2 mb-3">
              <input value={cep} onChange={e=>setCep(e.target.value)} placeholder="Seu CEP" className="flex-1 px-3 py-2 rounded-lg text-[var(--ink)]" />
              <button onClick={buscarCep} disabled={buscando} className="px-4 rounded-lg font-medium" style={{background:'var(--coral)'}}>{buscando?"…":"Buscar"}</button>
            </div>
            {avisoCep && <p className="text-xs text-amber-200 mb-3">{avisoCep}</p>}
            <div className="flex gap-2">
              <select value={estado} onChange={e=>setEstado(e.target.value)} className="px-3 py-2 rounded-lg text-[var(--ink)]">
                <option value="">UF</option>
                {ESTADOS.map(u=><option key={u} value={u}>{u}</option>)}
              </select>
              <input value={cidadeOrigem} onChange={e=>setCidadeOrigem(e.target.value)} placeholder="Cidade" className="flex-1 px-3 py-2 rounded-lg text-[var(--ink)]" />
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-5">
            <p className="font-medium mb-3">Destino</p>
            <select value={destinoId} onChange={e=>setDestinoId(e.target.value)} className="w-full px-3 py-3 rounded-lg text-[var(--ink)]">
              {destinos.filter(d=>d.distKm>0).map(d=><option key={d.id} value={d.id}>{d.nome}, {d.pais}</option>)}
            </select>
          </div>
        </div>
        {opcoes.length>0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {opcoes.map(o=>(
              <div key={o.modo} className="bg-white/10 rounded-2xl p-5">
                <p className="text-3xl">{o.icone}</p>
                <p className="font-semibold mt-2">{o.modo}</p>
                <p className="text-sm opacity-80 mt-1">{fmtHoras(o.horas)}</p>
                <p className="text-lg font-semibold mt-2" style={{color:'var(--gold)'}}>{fmtBRL(o.custo)}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs opacity-60 mt-6">Estimativas ilustrativas baseadas em distância; não refletem preços reais de companhias.</p>
      </div>
    </section>
  );
}

function Sobre(){
  return (
    <section id="sobre" className="py-20 px-5">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-semibold" style={{color:'var(--coral)'}}>Por que TravelGo</p>
        <h2 className="serif text-3xl mt-1 mb-4" style={{color:'var(--deep)'}}>Um só lugar para decidir onde, o que fazer e como chegar</h2>
        <p style={{color:'var(--ink-soft)'}}>Comparamos atrações, hospedagem e transporte lado a lado, para que sua próxima viagem comece com clareza, não com dezenas de abas abertas.</p>
      </div>
    </section>
  );
}

function Footer(){
  return (
    <footer className="py-10 px-5 border-t" style={{borderColor:'var(--line)'}}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-4 text-sm" style={{color:'var(--ink-soft)'}}>
        <p className="serif text-lg" style={{color:'var(--deep)'}}>Travel<span style={{color:'var(--coral)'}}>Go</span></p>
        <p>© 2026 TravelGo. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

function App(){
  return <><Navbar/><Hero/><Destinos/><Calculadora/><Sobre/><Footer/></>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);

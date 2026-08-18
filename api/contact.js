export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method==='OPTIONS'){res.setHeader('Allow','POST, OPTIONS');return res.status(204).end()}
  if(req.method!=='POST'){res.setHeader('Allow','POST, OPTIONS');return res.status(405).json({error:'Method not allowed'})}
  try{
    const{name,email,subject,message,company,privacy,startedAt}=req.body||{};
    if(company)return res.status(200).json({ok:true});
    if(privacy!=='accepted')return res.status(400).json({error:'Conferma la lettura dell’informativa privacy.'});
    const elapsed=Date.now()-Number(startedAt||0);
    if(!Number.isFinite(elapsed)||elapsed<1800)return res.status(400).json({error:'Invio troppo rapido. Riprova tra un momento.'});
    if(!name||!email||!subject||!message)return res.status(400).json({error:'Compila tutti i campi obbligatori.'});
    if(String(name).length>120||String(email).length>254||String(subject).length>200||String(message).length>6000)return res.status(400).json({error:'Uno o più campi sono troppo lunghi.'});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))return res.status(400).json({error:'Indirizzo email non valido.'});
    const apiKey=process.env.RESEND_API_KEY;if(!apiKey)return res.status(500).json({error:'RESEND_API_KEY non configurata su Vercel.'});
    const esc=v=>String(v).replace(/[&<>"\']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const from=process.env.CONTACT_FROM||'Contatti sito <noreply@idipintidialisi.com>';
    const body='<h2>Nuova richiesta da idipintidialisi.com</h2><p><strong>Nome:</strong> '+esc(name)+'</p><p><strong>Email:</strong> '+esc(email)+'</p><p><strong>Oggetto/opera:</strong> '+esc(subject)+'</p><hr><p style="white-space:pre-wrap">'+esc(message)+'</p>';
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({from,to:['stefano.alisi@gmail.com','matteo.massitti@gmail.com'],reply_to:String(email),subject:'[idipintidialisi.com] '+String(subject).trim(),html:body})});
    const payload=await r.json().catch(()=>({})); if(!r.ok)return res.status(502).json({error:payload?.message||'Servizio email non disponibile.'});
    return res.status(200).json({ok:true,id:payload?.id||null})
  }catch(e){console.error(e);return res.status(500).json({error:'Errore interno durante l’invio.'})}
}

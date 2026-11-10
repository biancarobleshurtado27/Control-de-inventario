// Solo identificadores enteros positivos representables por INT en MySQL.
export function validarId(req,res,next){
 const valor=req.params.id;
 if(typeof valor!=='string'||!/^\d+$/.test(valor))return res.status(400).json({error:'Identificador inválido.'});
 const id=Number(valor);
 if(!Number.isSafeInteger(id)||id<1||id>2147483647)return res.status(400).json({error:'Identificador inválido.'});
 req.idValidado=id;
 next();
}

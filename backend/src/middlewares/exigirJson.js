// Se aplica solo a las rutas que reciben datos de un formulario.
export function exigirJson(req,res,next){
 if(!req.is('application/json'))return res.status(415).json({error:'Envía los datos con Content-Type: application/json.'});
 next();
}

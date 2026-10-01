import { Router } from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
const router = Router(); router.use(protect);
router.get('/', async (req,res) => {
  const filter = req.user.role === 'admin' ? {} : { $or: [{ shared: true }, { owner: req.user._id }] };
  res.json({ messages: await Message.find(filter).sort({ shared: -1, updatedAt: -1 }).lean() });
});
router.post('/', async (req,res) => {
  const title=String(req.body.title||'').trim(), body=String(req.body.body||'').trim();
  if (!title||!body) return res.status(400).json({message:'Title and message are required'});
  const message=await Message.create({title,body,label:req.body.label||'General',shared:req.user.role==='admin'&&Boolean(req.body.shared),owner:req.user._id,ownerName:req.user.name});
  res.status(201).json({message});
});
router.put('/:id', async(req,res)=>{
  const message=await Message.findById(req.params.id); if(!message) return res.status(404).json({message:'Template not found'});
  if(req.user.role!=='admin'&&String(message.owner)!==String(req.user._id)) return res.status(403).json({message:'You can only edit your own templates'});
  for(const k of ['title','body','label']) if(req.body[k]!==undefined) message[k]=req.body[k];
  if(req.user.role==='admin'&&req.body.shared!==undefined) message.shared=Boolean(req.body.shared);
  await message.save(); res.json({message});
});
router.delete('/:id', async(req,res)=>{
  const message=await Message.findById(req.params.id); if(!message) return res.status(404).json({message:'Template not found'});
  if(req.user.role!=='admin'&&String(message.owner)!==String(req.user._id)) return res.status(403).json({message:'You can only delete your own templates'});
  await message.deleteOne(); res.json({ok:true});
});
export default router;

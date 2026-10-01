import { Router } from 'express';
import Setting from '../models/Setting.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router=Router(); router.use(protect);
router.get('/',async(req,res)=>{const s=await Setting.findOne({key:'statuses'});res.json({statuses:s?.value||[]});});
router.put('/statuses',adminOnly,async(req,res)=>{
 const statuses=[...new Set((req.body.statuses||[]).map(x=>String(x).trim()).filter(Boolean))];
 if(!statuses.length)return res.status(400).json({message:'Keep at least one status'});
 await Setting.updateOne({key:'statuses'},{$set:{value:statuses}},{upsert:true});res.json({statuses});
});
export default router;

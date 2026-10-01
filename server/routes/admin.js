import { Router } from 'express';
import path from 'node:path';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { importCsv } from '../utils/importCsv.js';
const router=Router(); router.use(protect,adminOnly);

router.get('/users',async(req,res)=>{
 const users=await User.find().sort({role:1,name:1}).lean();
 const perf=await Activity.aggregate([{$match:{type:'call'}},{$group:{_id:'$user',calls:{$sum:1},lastActivity:{$max:'$createdAt'}}}]);
 res.json({users:users.map(u=>({...u,calls:perf.find(p=>String(p._id)===String(u._id))?.calls||0,lastActivity:perf.find(p=>String(p._id)===String(u._id))?.lastActivity}))});
});
router.post('/users',async(req,res)=>{
 const {name,username,password}=req.body;
 if(!String(name||'').trim()||!String(username||'').trim())return res.status(400).json({message:'Name and username are required'});
 if(String(password||'').length<8)return res.status(400).json({message:'Password must have at least 8 characters'});
 const user=await User.create({name:String(name).trim(),username:String(username).trim().toLowerCase(),passwordHash:await User.hashPassword(password),role:'member',assignedDistricts:req.body.assignedDistricts||[]});
 res.status(201).json({user});
});
router.put('/users/:id',async(req,res)=>{
 const user=await User.findById(req.params.id);if(!user)return res.status(404).json({message:'User not found'});
 if(String(user._id)===String(req.user._id)&&req.body.active===false)return res.status(400).json({message:'You cannot deactivate your own account'});
 for(const key of ['name','active','assignedDistricts'])if(req.body[key]!==undefined)user[key]=req.body[key];
 if(req.body.password){if(String(req.body.password).length<8)return res.status(400).json({message:'Password must have at least 8 characters'});user.passwordHash=await User.hashPassword(req.body.password);}
 await user.save();res.json({user});
});
router.get('/districts',async(req,res)=>{
 const districts=await Lead.aggregate([{$group:{_id:'$district',total:{$sum:1},assigned:{$sum:{$cond:[{$gt:[{$size:'$assignedTo'},0]},1,0]}}}},{$sort:{_id:1}}]);
 const users=await User.find({role:'member',active:true},'name username assignedDistricts').lean();
 res.json({districts:districts.map(d=>({name:d._id,total:d.total,members:users.filter(u=>u.assignedDistricts?.includes(d._id)).map(u=>({_id:u._id,name:u.name}))})),users});
});
router.post('/assign-leads',async(req,res)=>{
 const {district,userIds}=req.body;if(!district)return res.status(400).json({message:'District is required'});
 const valid=await User.find({_id:{$in:userIds||[]},role:'member',active:true}).distinct('_id');
 const result=await Lead.updateMany({district},{$set:{assignedTo:valid}});
 await Promise.all([
   User.updateMany({role:'member',_id:{$in:valid}},{$addToSet:{assignedDistricts:district}}),
   User.updateMany({role:'member',_id:{$nin:valid}},{$pull:{assignedDistricts:district}})
 ]);
 await Activity.create({type:'assignment',user:req.user._id,userName:req.user.name,detail:`Assigned ${district} to ${valid.length} team member(s)`,district,metadata:{userIds:valid}});
 res.json({message:`Updated ${result.modifiedCount} leads`,count:result.modifiedCount});
});
router.post('/import',async(req,res)=>{
 const existing=await Lead.estimatedDocumentCount();
 const result=await importCsv(path.resolve('inspire_haryana_private_schools.csv'));
 res.json({message:`Import complete. ${result.upserted} new leads added; ${existing} already existed.`,...result});
});
router.get('/performance',async(req,res)=>{
 const since=new Date(Date.now()-30*864e5);
 const rows=await Activity.aggregate([{$match:{createdAt:{$gte:since},type:{$in:['call','whatsapp','status']}}},{$group:{_id:{user:'$user',name:'$userName'},calls:{$sum:{$cond:[{$eq:['$type','call']},1,0]}},whatsapp:{$sum:{$cond:[{$eq:['$type','whatsapp']},1,0]}},updates:{$sum:{$cond:[{$eq:['$type','status']},1,0]}}}},{$sort:{calls:-1}}]);
 res.json({performance:rows.map(x=>({userId:x._id.user,name:x._id.name,calls:x.calls,whatsapp:x.whatsapp,updates:x.updates}))});
});
export default router;

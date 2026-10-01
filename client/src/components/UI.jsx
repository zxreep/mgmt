import {X,LoaderCircle,CheckCircle2,AlertCircle} from 'lucide-react';
import {cx} from '../api';
export function Button({children,variant='primary',className='',loading,...props}){return <button className={cx('btn',`btn-${variant}`,className)} disabled={loading||props.disabled} {...props}>{loading?<LoaderCircle size={17} className="spin"/>:children}</button>}
export function Badge({children,tone='neutral'}){return <span className={`badge badge-${tone}`}>{children}</span>}
export function Empty({icon:Icon,title,text}){return <div className="empty">{Icon&&<Icon size={30}/>}<strong>{title}</strong><p>{text}</p></div>}
export function Skeleton({height=80}){return <div className="skeleton" style={{height}}/>}
export function Modal({title,onClose,children,wide=false}){return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={cx('modal',wide&&'modal-wide')}><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}><X size={20}/></button></div>{children}</div></div>}
export function Toast({toast,onClose}){if(!toast)return null;return <div className={cx('toast',toast.type==='error'&&'toast-error')}>{toast.type==='error'?<AlertCircle/>:<CheckCircle2/>}<span>{toast.message}</span><button onClick={onClose}><X size={16}/></button></div>}

import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowUp, Check, ChevronRight, CircleHelp, Clock3, ExternalLink, LogOut, MapPin, MessageCircle, Plus, Send, Settings2, ThumbsDown, ThumbsUp, Users, X } from 'lucide-react'
import { applyVote, getVoteCounts, initialTrip, sortOptions } from './lib/trip'
import { addCarOption, addComment, addStayOption, ensureSession, joinTrip, loadTripData, myMembership, saveVote } from './lib/api'
import { config, isSupabaseConfigured, supabase } from './lib/supabase'
import './styles.css'

const demoMember = initialTrip.members[0]

function VoteButtons({ votes, memberId, onVote }) {
  const counts = getVoteCounts(votes)
  const mine = votes.find((vote) => vote.memberId === memberId)?.value
  return <div className="vote-row">
    <button className={`vote-button ${mine === 'up' ? 'selected up' : ''}`} onClick={() => onVote(mine === 'up' ? null : 'up')}><ThumbsUp size={15} /> {counts.up}</button>
    <button className={`vote-button ${mine === 'down' ? 'selected down' : ''}`} onClick={() => onVote(mine === 'down' ? null : 'down')}><ThumbsDown size={15} /> {counts.down}</button>
  </div>
}

function SectionHeading({ eyebrow, title, action, onAction }) {
  return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{action && <button className="button secondary" onClick={onAction}><Plus size={16} /> {action}</button>}</div>
}

function AddModal({ type, draft, setDraft, onClose, onSave }) {
  const isStay = type === 'stay'
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onSubmit={(event) => { event.preventDefault(); onSave() }} onMouseDown={(event) => event.stopPropagation()}>
    <div className="modal-heading"><div><span className="eyebrow">{isStay ? 'NEW STAY' : 'NEW CAR PLAN'}</span><h2>{isStay ? '添加住宿候选' : '添加租车方案'}</h2></div><button type="button" className="icon-button" onClick={onClose} title="关闭"><X size={18} /></button></div>
    <div className="form-grid">
      {isStay ? <><label>晚次<input required value={draft.night || ''} onChange={(event) => setDraft({ ...draft, night: event.target.value })} placeholder="如 10.02" /></label><label>城市<input required value={draft.city || ''} onChange={(event) => setDraft({ ...draft, city: event.target.value })} placeholder="如 景洪" /></label><label className="wide">名称<input required value={draft.title || ''} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="住宿名称" /></label><label className="wide">位置<input required value={draft.location || ''} onChange={(event) => setDraft({ ...draft, location: event.target.value })} placeholder="区域或地址" /></label><label>人均价格<input required value={draft.price || ''} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="¥200/人" /></label><label>详情链接<input value={draft.link || ''} onChange={(event) => setDraft({ ...draft, link: event.target.value })} placeholder="https://" /></label></> : <><label className="wide">方案名称<input required value={draft.title || ''} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="如 9座商务车" /></label><label>车型<input value={draft.subtitle || ''} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} placeholder="别克GL8 / 同级" /></label><label>座位数<input required value={draft.seats || ''} onChange={(event) => setDraft({ ...draft, seats: event.target.value })} placeholder="9座" /></label><label>租用时间<input required value={draft.dates || ''} onChange={(event) => setDraft({ ...draft, dates: event.target.value })} placeholder="10/02 晚 - 10/07" /></label><label>总价<input required value={draft.price || ''} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="¥2,680" /></label><label className="wide">备注<input value={draft.note || ''} onChange={(event) => setDraft({ ...draft, note: event.target.value })} placeholder="行李空间、保险、取还车等" /></label></>}
    </div>
    <div className="modal-actions"><button type="button" className="button" onClick={onClose}>取消</button><button type="submit" className="button primary"><Plus size={15} /> 添加候选</button></div>
  </form></div>
}

function JoinScreen({ busy, error, onJoin }) {
  const [nickname, setNickname] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  function submit(event) {
    event.preventDefault()
    if (!nickname.trim() || !inviteCode.trim()) return
    onJoin(nickname.trim(), inviteCode.trim())
  }
  return <div className="join-screen"><form className="join-card" onSubmit={submit}>
    <div className="brand"><div className="brand-mark">滇</div><div><strong>滇南同行</strong><span>云南 · 6人旅行空间</span></div></div>
    <h1>与同行者，<em>走到一起。</em></h1>
    <p className="join-intro">输入昵称和邀请码，进入专属旅行空间。邀请码请向管理员索要。</p>
    <div className="join-fields"><label>你的昵称<input required value={nickname} maxLength={30} onChange={(event) => setNickname(event.target.value)} placeholder="如 阿周" autoFocus /></label><label>邀请码<input required value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="管理员提供的邀请码" /></label></div>
    {error && <div className="join-error"><CircleHelp size={15} /> {error}</div>}
    <button type="submit" className="button primary join-submit" disabled={busy}>{busy ? '正在加入…' : '加入旅行空间'}</button>
    <p className="join-foot">加入后，你的投票和评论将以昵称展示给其他同行者</p>
  </form></div>
}

function App() {
  const [tab, setTab] = useState('itinerary')
  const [trip, setTrip] = useState(initialTrip)
  const [selectedCity, setSelectedCity] = useState('全部')
  const [commenting, setCommenting] = useState(null)
  const [comment, setComment] = useState('')
  const [toast, setToast] = useState('')
  const [modalType, setModalType] = useState(null)
  const [draft, setDraft] = useState({})
  const [member, setMember] = useState(null)
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [joinBusy, setJoinBusy] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [syncLabel, setSyncLabel] = useState('同步中…')
  const loadingRef = useRef(false)
  const pendingRef = useRef(false)

  const me = member ? { id: member.id, name: member.name } : demoMember
  const connected = Boolean(member)

  function notify(message) { setToast(message); window.setTimeout(() => setToast(''), 2600) }

  async function loadData(silent) {
    if (loadingRef.current) { pendingRef.current = true; return }
    loadingRef.current = true
    if (!silent) setSyncLabel('同步中…')
    try {
      const data = await loadTripData(config.tripId)
      setTrip(data)
      setSyncLabel('已同步')
      setJoinError('')
    } catch {
      setSyncLabel('同步失败')
    } finally {
      loadingRef.current = false
      if (pendingRef.current) { pendingRef.current = false; loadData(true) }
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return
    ;(async () => {
      try {
        await ensureSession()
        const membership = await myMembership()
        if (membership) setMember(membership)
      } catch {
        setJoinError('无法连接服务器，请检查网络后刷新页面重试')
      } finally {
        setAuthReady(true)
      }
    })()
  }, [])

  useEffect(() => {
    if (!member) return
    loadData(false)
    const channel = supabase.channel('trip-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        if (payload.new?.trip_id === config.tripId || payload.old?.trip_id === config.tripId) loadData(true)
      })
      .subscribe()
    const poll = window.setInterval(() => loadData(true), 30000)
    const onVisible = () => { if (document.visibilityState === 'visible') loadData(true) }
    document.addEventListener('visibilitychange', onVisible)
    return () => { channel.unsubscribe(); window.clearInterval(poll); document.removeEventListener('visibilitychange', onVisible) }
  }, [member])

  async function handleJoin(nickname, inviteCode) {
    setJoinBusy(true); setJoinError('')
    try {
      const membership = await joinTrip(config.tripId, inviteCode, nickname)
      setMember(membership)
      notify(`欢迎加入，${membership.name}`)
    } catch (error) {
      setJoinError(error.message?.toLowerCase().includes('invite') ? '邀请码不正确，请和管理员核对' : '加入失败，请稍后再试')
    } finally {
      setJoinBusy(false)
    }
  }

  async function handleExit() {
    await supabase.auth.signOut()
    setMember(null)
    setTrip(initialTrip)
    setSyncLabel('同步中…')
  }

  async function updateVote(type, id, value) {
    const targetType = type === 'cars' ? 'car' : 'stay'
    setTrip((current) => ({ ...current, [type]: current[type].map((item) => item.id === id ? { ...item, votes: applyVote(item.votes, me.id, value) } : item) }))
    notify(value ? '已记录你的选择' : '已取消投票')
    if (member) {
      try { await saveVote(config.tripId, member.id, targetType, id, value); await loadData(true) } catch { notify('同步失败，请稍后重试') }
    }
  }

  async function addCommentTo(stayId) {
    if (!comment.trim()) return
    const text = comment.trim()
    setComment(''); setCommenting(null); notify('评论已添加')
    setTrip((current) => ({ ...current, stays: current.stays.map((stay) => stay.id === stayId ? { ...stay, comments: [...stay.comments, { member: me.name, text, time: '刚刚' }] } : stay) }))
    if (member) {
      try { await addComment(config.tripId, member.id, stayId, text); await loadData(true) } catch { notify('同步失败，请稍后重试') }
    }
  }

  function openModal(type) { setDraft({}); setModalType(type) }

  async function saveDraft() {
    if (modalType === 'stay') {
      const newStay = { ...draft, id: `stay-${Date.now()}`, tag: '新候选', detail: '由同行者添加，等待大家投票。', link: draft.link || '#', votes: [], comments: [] }
      setTrip((current) => ({ ...current, stays: [...current.stays, newStay] }))
      if (member) {
        try { await addStayOption(config.tripId, member.id, draft); await loadData(true) } catch { notify('同步失败，请稍后重试') }
      }
    }
    if (modalType === 'car') {
      const newCar = { ...draft, id: `car-${Date.now()}`, tag: '新方案', deposit: '押金待确认', votes: [] }
      setTrip((current) => ({ ...current, cars: [...current.cars, newCar] }))
      if (member) {
        try { await addCarOption(config.tripId, member.id, draft); await loadData(true) } catch { notify('同步失败，请稍后重试') }
      }
    }
    setModalType(null); notify('候选已添加，等待大家投票')
  }

  const cities = ['全部', ...new Set(trip.stays.map((stay) => stay.city))]
  const visibleStays = selectedCity === '全部' ? trip.stays : trip.stays.filter((stay) => stay.city === selectedCity)

  if (!authReady) return <div className="boot-loading"><div className="brand-mark">滇</div><span>正在连接旅行空间…</span></div>
  if (isSupabaseConfigured && !member) return <JoinScreen busy={joinBusy} error={joinError} onJoin={handleJoin} />

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">滇</div><div><strong>滇南同行</strong><span>云南 · 6人旅行空间</span></div></div>
      <div className="top-actions"><div className="sync-state"><span className="live-dot" />{isSupabaseConfigured ? syncLabel : '演示数据'}</div><button className="icon-button" title="帮助"><CircleHelp size={19} /></button><div className="avatar">{me.name.slice(0, 1)}</div></div>
    </header>
    <main>
      <section className="hero-panel">
        <div className="hero-copy"><div className="kicker">国庆旅行 · 09.30 — 10.07</div><h1>把每一步，<em>走成风景。</em></h1><p>昆明 → 西双版纳 → 景迈山 → 普洱 → 抚仙湖</p><div className="hero-meta"><span><Clock3 size={15} /> 8天7晚</span><span><Users size={15} /> {connected ? `${trip.members.length} 位同行者` : '6位同行者'}</span><span><MapPin size={15} /> 云南</span></div></div>
        <div className="hero-photo"><div className="photo-label"><span>当前计划</span><strong>02</strong><small>热带植物园</small></div></div>
      </section>
      <nav className="tabs" aria-label="旅行板块"><button className={tab === 'itinerary' ? 'active' : ''} onClick={() => setTab('itinerary')}><span>01</span>行程</button><button className={tab === 'car' ? 'active' : ''} onClick={() => setTab('car')}><span>02</span>租车选择</button><button className={tab === 'stay' ? 'active' : ''} onClick={() => setTab('stay')}><span>03</span>每晚住宿</button></nav>

      {tab === 'itinerary' && <section className="content-section"><SectionHeading eyebrow="DAILY PLAN" title="每天去哪里" action="添加事项" onAction={() => notify('行程由管理员维护，新增事项功能即将接入')} /><div className="notice"><div className="notice-icon"><Check size={16} /></div><div><strong>{connected ? '数据已实时同步' : '当前版本已同步'}</strong><span>{connected ? `${syncLabel} · ${trip.members.length} 位成员已加入` : '最后更新：今天 14:32 · 管理员 林野'}</span></div><ArrowUp size={17} className="notice-arrow" /></div><div className="timeline">{trip.itinerary.map((day, index) => <article className={`day-row ${index === 2 ? 'today' : ''}`} key={day.id || day.date}><div className="day-date"><strong>{day.date}</strong><span>{day.weekday}</span></div><div className="day-line"><span className="line-dot" /></div><div className="day-content"><div className="day-title"><div><div className="day-place">{day.place}</div><h3>{day.title}</h3></div><span className={`status ${day.status === '重点日' ? 'accent' : ''}`}>{day.status}</span></div><ul>{day.items.map((item) => <li key={item}>{item}</li>)}</ul></div><button className="row-arrow" title="查看详情"><ChevronRight size={18} /></button></article>)}</div></section>}

      {tab === 'car' && <section className="content-section"><SectionHeading eyebrow="CAR SHORTLIST" title="租车怎么选" action="添加方案" onAction={() => openModal('car')} /><div className="decision-banner"><div><span className="eyebrow">建议取车时间</span><strong>10月2日 18:00 后 · 告庄取车</strong><p>植物园当天用接送车，晚上取车后一路自驾至昆明。</p></div><div className="banner-route"><span>景洪</span><ChevronRight size={16} /><span>景迈山</span><ChevronRight size={16} /><span>昆明机场</span></div></div><div className="option-grid">{trip.cars.map((car, index) => <article className="option-card" key={car.id}><div className="option-top">{car.tag ? <span className={`tag ${car.tag === '推荐' ? 'warm' : ''}`}>{car.tag}</span> : <span />}<span className="option-id">方案 {index + 1}</span></div><h3>{car.title}</h3><p className="muted">{car.subtitle}</p><div className="specs"><span><Users size={15} /> {car.seats}</span><span><Clock3 size={15} /> {car.dates}</span></div><div className="price-line"><strong>{car.price}</strong><span>{car.deposit}</span></div><p className="card-note">{car.note}</p><div className="card-footer"><VoteButtons votes={car.votes} memberId={me.id} onVote={(value) => updateVote('cars', car.id, value)} />{car.link ? <a className="text-button" href={car.link} target="_blank" rel="noreferrer"><ExternalLink size={15} /> 查看链接</a> : <button className="text-button" onClick={() => notify('暂无链接，可请管理员补充')}><ExternalLink size={15} /> 查看链接</button>}</div></article>)}</div></section>}

      {tab === 'stay' && <section className="content-section"><SectionHeading eyebrow="STAY TOGETHER" title="每晚住哪里" action="添加住宿" onAction={() => openModal('stay')} /><div className="filter-row"><div className="city-filters">{cities.map((city) => <button key={city} className={selectedCity === city ? 'active' : ''} onClick={() => setSelectedCity(city)}>{city}</button>)}</div><span className="result-count">{visibleStays.length} 个夜晚候选</span></div><div className="stay-list">{sortOptions(visibleStays).map((stay) => <article className="stay-card" key={stay.id}><div className="stay-date"><strong>{stay.night}</strong><span>{stay.city}</span></div><div className="stay-main"><div className="stay-heading"><div>{stay.tag && <span className="tag">{stay.tag}</span>}<h3>{stay.title}</h3></div><strong className="stay-price">{stay.price}</strong></div><div className="location"><MapPin size={15} /> {stay.location}</div><p>{stay.detail}</p><div className="stay-actions"><VoteButtons votes={stay.votes} memberId={me.id} onVote={(value) => updateVote('stays', stay.id, value)} /><button className="comment-button" onClick={() => setCommenting(commenting === stay.id ? null : stay.id)}><MessageCircle size={16} /> {stay.comments.length} 条评论</button>{stay.link ? <a className="text-button" href={stay.link} target="_blank" rel="noreferrer"><ExternalLink size={15} /> 详情</a> : <span className="text-button"><ExternalLink size={15} /> 详情</span>}</div>{stay.comments.length > 0 && <div className="comments">{stay.comments.map((item, index) => <div className="comment" key={`${item.id || item.member}-${index}`}><div className="mini-avatar">{item.member.slice(0, 1)}</div><div><strong>{item.member} <small>{item.time}</small></strong><p>{item.text}</p></div></div>)}</div>}{commenting === stay.id && <div className="comment-compose"><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="写下你的想法…" onKeyDown={(event) => event.key === 'Enter' && addCommentTo(stay.id)} /><button onClick={() => addCommentTo(stay.id)} title="发送"><Send size={16} /></button></div>}</div></article>)}</div></section>}
    </main>
    <footer className="footer"><span>旅行空间 · 仅限同行者</span><div className="footer-actions">{connected && <button className="text-button" onClick={handleExit}><LogOut size={14} /> 退出</button>}<span><Settings2 size={14} /> {member?.role === 'admin' ? '管理员模式' : '同行者模式'}</span></div></footer>
    {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    {modalType && <AddModal type={modalType} draft={draft} setDraft={setDraft} onClose={() => setModalType(null)} onSave={saveDraft} />}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)

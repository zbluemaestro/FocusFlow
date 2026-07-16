import React, { useState, useEffect, useRef } from 'react';
import { Users, ArrowLeft, MessageSquare, Send, Zap, Shield, Sparkles, Smile, Star, Flame, Trophy, Plus, Check, X, Search } from 'lucide-react';
import { StudyRoom, StudyBuddy, ChatMessage, UserProfile } from '../types';
import { INITIAL_BUDDIES, CHAT_PRESETS, BUDDY_RESPONSES } from '../data/mockData';

interface StudyRoomsProps {
  profile: UserProfile;
  themePrimaryClass: string;
  themeAccentClass: string;
  themeCardClass: string;
  onLoggedSystemMessage?: () => void; // Triggered when user chats to unlock badge
}

export default function StudyRooms({
  profile,
  themePrimaryClass,
  themeAccentClass,
  themeCardClass,
  onLoggedSystemMessage
}: StudyRoomsProps) {
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null);
  const [availableRooms, setAvailableRooms] = useState<StudyRoom[]>([]);
  const [allSchoolBuddies, setAllSchoolBuddies] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  
  // Custom Room Creation state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomTagline, setNewRoomTagline] = useState('');
  const [newRoomIcon, setNewRoomIcon] = useState('Coffee');
  const [searchBuddyText, setSearchBuddyText] = useState('');
  const [invitedBuddies, setInvitedBuddies] = useState<string[]>([]); // names of invited students

  // Simulated State for current room session
  const [buddies, setBuddies] = useState<StudyBuddy[]>(INITIAL_BUDDIES);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [groupGoalCount, setGroupGoalCount] = useState(11);
  const [emojiBursts, setEmojiBursts] = useState<{ id: number; symbol: string; x: number; y: number }[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const emojiIdCounter = useRef(0);

  // Fetch available rooms and school student buddies list on mount
  const refreshRoomsList = () => {
    fetch('/api/rooms')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load rooms');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableRooms(data);
        }
        setRoomsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching rooms:', err);
        setRoomsLoading(false);
      });
  };

  useEffect(() => {
    refreshRoomsList();

    fetch('/api/buddies/list')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load buddies list');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAllSchoolBuddies(data);
        }
      })
      .catch((err) => console.error('Error fetching buddies list:', err));
  }, []);

  // 1. Fetch Room Buddies and setup chat polling on joining a room
  useEffect(() => {
    if (!selectedRoom) {
      setChatMessages([]);
      return;
    }

    // Fetch Room Buddies from the backend database (derived from the 300 global students)
    fetch(`/api/rooms/${selectedRoom.id}/buddies`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load buddies');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map((b: any, index: number) => ({
            id: b.id,
            name: b.name,
            avatar: b.avatar,
            status: index % 3 === 0 ? 'break' : (index % 4 === 0 ? 'idle' : 'focusing'),
            currentTaskName: b.specialty,
            activeTimerRemaining: index % 3 === 0 ? Math.floor(Math.random() * 300) + 30 : (index % 4 === 0 ? 0 : Math.floor(Math.random() * 1200) + 200),
            totalXp: Math.floor(Math.random() * 3000) + 800,
            currentStreak: Math.floor(Math.random() * 20) + 1,
            color: b.color
          }));
          setBuddies(mapped);
        }
      })
      .catch((err) => console.error('Error fetching room buddies:', err));

    // Fetch Room Messages and setup polling interval
    const fetchMessages = () => {
      fetch(`/api/rooms/${selectedRoom.id}/messages`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load messages');
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setChatMessages(data);
          }
        })
        .catch((err) => console.error('Error fetching room messages:', err));
    };

    // Run initial fetch immediately
    fetchMessages();

    // Poll messages every 1.5 seconds to display messages from other users and automated agents in real-time
    const pollInterval = setInterval(fetchMessages, 1500);

    // Reset group goal count slightly per room for variety
    setGroupGoalCount(Math.floor(Math.random() * 5) + 12);

    return () => {
      clearInterval(pollInterval);
    };
  }, [selectedRoom]);

  // 2. Buddy Timers & State tick (Decrements active focus counters in real-time)
  useEffect(() => {
    if (!selectedRoom) return;

    const interval = setInterval(() => {
      setBuddies((prevBuddies) =>
        prevBuddies.map((buddy) => {
          if (buddy.activeTimerRemaining > 1) {
            return { ...buddy, activeTimerRemaining: buddy.activeTimerRemaining - 1 };
          } else {
            // Timer expired! Toggle status (focusing <=> break)
            const wasFocusing = buddy.status === 'focusing';
            const nextStatus = wasFocusing ? 'break' : 'focusing';
            
            if (wasFocusing) {
              setGroupGoalCount(g => g + 1);
            }

            return {
              ...buddy,
              status: nextStatus as any,
              activeTimerRemaining: nextStatus === 'focusing' ? 1500 : 300, // reset to standard durations
              totalXp: buddy.totalXp + (wasFocusing ? 50 : 0)
            };
          }
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedRoom]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Spawn an emoji floating burst
  const spawnEmojiBurst = (symbol: string, isUserSource = true) => {
    emojiIdCounter.current += 1;
    const newId = emojiIdCounter.current;
    
    // Randomize horizontal positioning inside relative panel
    const x = isUserSource ? (Math.random() * 40 + 50) : (Math.random() * 40 + 10); // user shoots from right, peers from left
    const y = 85; // starting height index

    setEmojiBursts((prev) => [...prev, { id: newId, symbol, x, y }]);

    // Remove emoji from state after animation completes
    setTimeout(() => {
      setEmojiBursts((prev) => prev.filter((e) => e.id !== newId));
    }, 1800);
  };

  const triggerPeerEmojiBurst = () => {
    const symbols = ['🔥', '💖', '👍', '👋', '🚀', '⭐', '🙌'];
    const rEmoji = symbols[Math.floor(Math.random() * symbols.length)];
    spawnEmojiBurst(rEmoji, false);
  };

  // Submit chat message to server API
  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    const payload = {
      senderName: profile.name,
      senderColor: 'text-rose-400 font-black',
      message: messageText.trim()
    };

    setTypedMessage('');

    // Post to the room's backend endpoint (this shares the message with other users and triggers bot replies)
    fetch(`/api/rooms/${selectedRoom?.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to send message');
        return res.json();
      })
      .then((newMessage) => {
        // Optimistically append the sent message so it displays instantly
        setChatMessages((prev) => [...prev, { ...newMessage, isUser: true }]);
        
        if (onLoggedSystemMessage) {
          onLoggedSystemMessage(); // trigger badge callback to unlock chat achievement
        }
      })
      .catch((err) => console.error('Error sending message:', err));

    // Spawn direct emoji burst if they chatted an emoji
    if (['🔥', '💖', '👍', '👋', '🚀'].includes(messageText.trim())) {
      spawnEmojiBurst(messageText.trim());
    }
  };

  const formatTimerMinSec = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getRoomStyles = (icon: string) => {
    switch (icon) {
      case 'Coffee': return { border: 'hover:border-amber-500/40', glow: 'bg-amber-500/5', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'BookOpen': return { border: 'hover:border-indigo-500/40', glow: 'bg-indigo-500/5', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'Terminal': return { border: 'hover:border-purple-500/40', glow: 'bg-purple-500/5', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default: return { border: 'hover:border-emerald-500/40', glow: 'bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
  };

  const getBuddyAvatarClass = (colorClass: string) => {
    if (colorClass.includes('indigo')) return 'bg-indigo-950/50 border-indigo-800 text-indigo-400';
    if (colorClass.includes('emerald')) return 'bg-emerald-950/50 border-emerald-800 text-emerald-400';
    if (colorClass.includes('pink')) return 'bg-pink-950/50 border-pink-800 text-pink-400';
    if (colorClass.includes('amber')) return 'bg-amber-950/50 border-amber-800 text-amber-400';
    return 'bg-purple-950/50 border-purple-800 text-purple-400';
  };

  const getSenderColorClass = (colorClass: string) => {
    if (colorClass.includes('indigo')) return 'text-indigo-400 font-bold';
    if (colorClass.includes('emerald')) return 'text-emerald-400 font-bold';
    if (colorClass.includes('pink')) return 'text-pink-400 font-bold';
    if (colorClass.includes('amber')) return 'text-amber-400 font-bold';
    if (colorClass.includes('rose')) return 'text-rose-400 font-black';
    return 'text-purple-400 font-bold';
  };

  const handleCreateCustomRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    fetch('/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newRoomName.trim(),
        description: newRoomDescription.trim(),
        tagline: newRoomTagline.trim() || 'Custom private focus lounge',
        icon: newRoomIcon,
        invitedBuddyNames: invitedBuddies
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create custom study room');
        return res.json();
      })
      .then((newCreatedRoom) => {
        // Clear creation states
        setNewRoomName('');
        setNewRoomDescription('');
        setNewRoomTagline('');
        setNewRoomIcon('Coffee');
        setInvitedBuddies([]);
        setSearchBuddyText('');
        setShowCreateForm(false);
        
        // Refresh dynamic list and join it automatically
        fetch('/api/rooms')
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setAvailableRooms(data);
              const matched = data.find((r) => r.id === newCreatedRoom.id);
              if (matched) {
                setSelectedRoom(matched);
              }
            }
          });
      })
      .catch((err) => console.error('Error creating custom study room:', err));
  };

  const handleToggleInviteBuddy = (buddyName: string) => {
    if (invitedBuddies.includes(buddyName)) {
      setInvitedBuddies((prev) => prev.filter((name) => name !== buddyName));
    } else {
      setInvitedBuddies((prev) => [...prev, buddyName]);
    }
  };

  const filteredSearchBuddies = searchBuddyText.trim()
    ? allSchoolBuddies
        .filter(
          (b) =>
            b.name.toLowerCase().includes(searchBuddyText.toLowerCase()) &&
            !invitedBuddies.includes(b.name)
        )
        .slice(0, 5)
    : [];

  return (
    <div className="max-w-4xl mx-auto select-none animate-in fade-in duration-300">
      
      {/* 1. LOBBY VIEW - Choose room */}
      {!selectedRoom ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-sans font-black text-slate-100 uppercase tracking-widest text-lg md:text-xl leading-none flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-slate-950 text-indigo-400 border border-slate-850">
                  <Users className="w-5 h-5" />
                </span>
                Virtual Study Rooms
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Connect and study in real-time alongside other students. Boost focus through social accountability.
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 bg-indigo-600 px-4 py-2.5 rounded-xl border border-indigo-500 transition-all cursor-pointer shadow-lg shadow-indigo-600/15 active:scale-95 self-start sm:self-center"
            >
              {showCreateForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showCreateForm ? 'Close Designer' : 'Build Custom Room'}</span>
            </button>
          </div>

          {/* Form to Create Custom Room */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateCustomRoom}
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl relative overflow-hidden space-y-4 animate-in slide-in-from-top-4 duration-300"
            >
              <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                <Sparkles className="w-16 h-16 text-indigo-400" />
              </div>
              <h3 className="font-sans font-black text-xs text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Custom Study Room Architect</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={32}
                    placeholder="e.g. Stanford CS 106B Hangout"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full p-2.5 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-950 text-slate-200 placeholder-slate-700 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                    Tagline / Subheader
                  </label>
                  <input
                    type="text"
                    maxLength={48}
                    placeholder="e.g. grinding pointers & linked lists"
                    value={newRoomTagline}
                    onChange={(e) => setNewRoomTagline(e.target.value)}
                    className="w-full p-2.5 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-950 text-slate-200 placeholder-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  Description / Study Guidelines
                </label>
                <textarea
                  rows={2}
                  maxLength={150}
                  placeholder="Describe your focus topic or invite requirements here..."
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-950 text-slate-200 placeholder-slate-700 font-semibold resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Icon */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                    Choose Theme Icon
                  </label>
                  <div className="flex gap-2">
                    {[
                      { name: 'Coffee', icon: '☕' },
                      { name: 'BookOpen', icon: '📖' },
                      { name: 'Terminal', icon: '💻' },
                      { name: 'Compass', icon: '🌲' }
                    ].map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setNewRoomIcon(item.name)}
                        className={`flex-1 p-2 text-center rounded-xl border text-sm transition-all cursor-pointer font-bold ${
                          newRoomIcon === item.name
                            ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-750'
                        }`}
                      >
                        {item.icon} <span className="text-[9px] block font-mono font-semibold uppercase">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Invite Buddies by Name Search */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                    Invite Students by Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type peer names (e.g. Gabriel, Sara, Jordan)"
                      value={searchBuddyText}
                      onChange={(e) => setSearchBuddyText(e.target.value)}
                      className="w-full pl-8 pr-2.5 p-2.5 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-950 text-slate-200 placeholder-slate-700 font-bold"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-700 absolute left-2.5 top-3" />
                  </div>

                  {/* Auto-suggestions list */}
                  {filteredSearchBuddies.length > 0 && (
                    <div className="mt-1.5 p-2 bg-slate-950 border border-slate-850 rounded-xl space-y-1 z-30 relative max-h-36 overflow-y-auto">
                      {filteredSearchBuddies.map((buddy) => (
                        <div
                          key={buddy.id}
                          className="flex items-center justify-between p-1.5 hover:bg-slate-900 rounded-lg transition-colors"
                        >
                          <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
                            <span className="text-xs">{buddy.avatar}</span>
                            {buddy.name}
                            <span className="text-[8px] font-mono text-slate-500">({buddy.specialty})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleToggleInviteBuddy(buddy.name);
                              setSearchBuddyText('');
                            }}
                            className="text-[9px] px-2 py-1 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 rounded-md font-bold transition-all cursor-pointer"
                          >
                            + Invite
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Display Currently Invited Buddies as tags */}
                  {invitedBuddies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {invitedBuddies.map((buddyName) => {
                        const originalBuddy = allSchoolBuddies.find((b) => b.name === buddyName);
                        return (
                          <span
                            key={buddyName}
                            className="flex items-center gap-1 text-[9px] px-2 py-1 bg-indigo-500/10 text-indigo-400 font-black rounded-lg border border-indigo-500/20"
                          >
                            <span>{originalBuddy?.avatar || '🎓'}</span>
                            <span>{buddyName}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleInviteBuddy(buddyName)}
                              className="text-slate-500 hover:text-indigo-300 font-black cursor-pointer ml-1 text-[10px]"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-sans text-xs font-black text-center border bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                Construct Custom Workspace & Summon Peers
              </button>
            </form>
          )}

          {roomsLoading ? (
            <div className="py-20 text-center">
              <span className="text-xs font-mono font-black text-slate-500 uppercase tracking-widest animate-pulse">
                Syncing Study Rooms Database...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {availableRooms.map((room) => {
                const styles = getRoomStyles(room.icon);
                return (
                  <div
                    key={room.id}
                    id={`room-card-${room.id}`}
                    className={`p-6 rounded-3xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between hover:shadow-2xl hover:bg-slate-900/70 transition-all duration-300 group relative overflow-hidden ${styles.border}`}
                  >
                    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${styles.glow} blur-2xl group-hover:scale-150 transition-all duration-500`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-3xl">
                          {room.icon === 'Coffee' ? '☕' :
                           room.icon === 'BookOpen' ? '📖' :
                           room.icon === 'Terminal' ? '💻' : '🌲'}
                        </span>
                        <span className="text-[9px] bg-slate-950 border border-slate-800 font-black font-mono px-2.5 py-1 rounded-md text-slate-400 shadow-sm flex items-center gap-1.5 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          {room.buddiesCount} active
                        </span>
                      </div>

                      <h3 className="font-sans font-black text-slate-100 text-sm md:text-base uppercase tracking-wider group-hover:text-indigo-400 transition-colors">
                        {room.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {room.description}
                      </p>
                      <span className="text-[9px] text-slate-500 font-mono block mt-2.5 uppercase tracking-widest font-black">
                        {room.tagline}
                      </span>
                    </div>

                    <button
                      id={`btn-join-room-${room.id}`}
                      onClick={() => setSelectedRoom(room)}
                      className="mt-5 relative z-10 w-full py-2.5 rounded-xl font-sans text-xs font-black text-center border bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/15 active:scale-95"
                    >
                      Take a Seat & Join
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        
        /* 2. INSIDE ACTIVE STUDY ROOM */
        <div className="space-y-6 relative">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedRoom(null)}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-100 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 transition-all cursor-pointer hover:border-slate-700 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Leave Study Room</span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">
                CONNECTED TO {selectedRoom.name.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Group Daily Goal Progress card */}
          <div className={`p-5 rounded-3xl ${themeCardClass} border border-slate-800 bg-slate-900/60 shadow-xl relative overflow-hidden`}>
            {/* Ambient Background sparkler */}
            <div className="absolute right-3 top-3 opacity-25">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <h3 className="font-sans font-black text-slate-100 text-xs uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  Shared Room Goal
                </h3>
                <p className="text-xs text-slate-400 mt-1.5">
                  Complete 18 Pomodoros together in this room today to earn a <strong className="text-indigo-400 font-bold">+100 XP collective bonus!</strong>
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Visual Ratio */}
                <span className="font-mono text-xl font-black text-slate-100">
                  {groupGoalCount} <span className="text-slate-500 text-xs">/ 18 🍅</span>
                </span>
                
                {/* Progress bar container */}
                <div className="w-36 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.min((groupGoalCount / 18) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Core Collaboration Frame: Live peers grid + Group Chat Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Active Peer Students grid (7/12 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Active Peers Focusing ({buddies.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* User Active Card in group list */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border-2 border-indigo-600 shadow-xl flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-900/40 border border-indigo-500/30 text-lg flex items-center justify-center flex-shrink-0 font-sans">
                    🎓
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-100 truncate">
                        {profile.name} (You)
                      </span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Live connection active" />
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      Connected study workspace
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 font-black uppercase rounded-md tracking-wider border border-indigo-500/20">
                        Studying
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {profile.streak}d streak 🔥
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Peer Cards */}
                {buddies.map((buddy, index) => {
                  const isFocusing = buddy.status === 'focusing';
                  return (
                    <div
                      key={`${buddy.id}-${index}`}
                      className={`p-4 rounded-2xl ${themeCardClass} border border-slate-850 bg-slate-900/40 hover:border-slate-800 shadow-lg flex items-start gap-3 transition-all`}
                    >
                      {/* Buddy Avatar */}
                      <div className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border flex-shrink-0 font-sans ${getBuddyAvatarClass(buddy.color)}`}>
                        {buddy.avatar}
                      </div>

                      {/* Info column */}
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-100 truncate">
                            {buddy.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                            Lvl {Math.floor(buddy.totalXp / 800) + 1}
                          </span>
                        </div>

                        {/* Task desc */}
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {isFocusing ? buddy.currentTaskName : 'Stretching & breathing'}
                        </p>

                        {/* Live Timer Countdown or Break Indicator */}
                        <div className="flex items-center justify-between gap-1.5 mt-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest ${
                              isFocusing
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-slate-950 text-slate-500 border border-slate-800'
                            }`}>
                              {isFocusing ? 'Focusing' : 'Break'}
                            </span>
                            
                            <span className="text-[10px] font-mono text-slate-300 font-black">
                              {formatTimerMinSec(buddy.activeTimerRemaining)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Group Chat and Interactive Box (5/12 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5 font-black uppercase tracking-widest text-slate-500">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  Room Live Chat
                </span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-black">
                  Real-time updates
                </span>
              </h3>

              {/* Chat Window Box */}
              <div className={`rounded-3xl border border-slate-800 p-4 bg-slate-900/60 shadow-xl h-80 flex flex-col justify-between relative overflow-hidden`}>
                
                {/* Emoji Float Overlay Container */}
                <div className="absolute inset-0 pointer-events-none z-20">
                  {emojiBursts.map((emoji) => (
                    <span
                      key={emoji.id}
                      className="emoji-burst text-2xl select-none"
                      style={{ left: `${emoji.x}%`, top: `${emoji.y}%` }}
                    >
                      {emoji.symbol}
                    </span>
                  ))}
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                  {chatMessages.map((msg, idx) => {
                    if (msg.isSystem) {
                      return (
                        <div key={`${msg.id}-${idx}`} className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-[10px] text-slate-400 leading-relaxed text-center font-bold">
                          {msg.message}
                        </div>
                      );
                    }
                    return (
                      <div key={`${msg.id}-${idx}`} className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-[10px] ${getSenderColorClass(msg.senderColor)}`}>
                            {msg.senderName}
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono">
                            {msg.timestamp}
                          </span>
                        </div>
                        <div className={`p-2.5 rounded-2xl text-xs max-w-[200px] mt-1 leading-relaxed ${
                          msg.isUser
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md font-bold'
                            : 'bg-slate-950 text-slate-300 border border-slate-850 rounded-tl-none font-semibold'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Interaction Section: Quick Emoji Tap Panel */}
                <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
                  <div className="flex justify-around items-center bg-slate-950 p-1.5 rounded-xl border border-slate-850">
                    {['🔥', '💖', '👍', '👋', '🚀'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          handleSendMessage(emoji);
                          triggerPeerEmojiBurst();
                        }}
                        title={`Send ${emoji} burst`}
                        className="p-1 rounded-lg text-sm hover:bg-slate-900 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Typing input */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Type supportive chatter..."
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage(typedMessage);
                      }}
                      className="flex-1 p-2.5 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-950 text-slate-200 placeholder-slate-600 font-bold"
                    />
                    <button
                      onClick={() => handleSendMessage(typedMessage)}
                      className="p-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

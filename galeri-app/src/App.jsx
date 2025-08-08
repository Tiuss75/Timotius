import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    signInAnonymously,
    signInWithCustomToken
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    onSnapshot, 
    doc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { setLogLevel } from "firebase/app";

// --- Konfigurasi Firebase ---
// Ganti dengan konfigurasi dari proyek Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyDk4SMx8BXldMFJfkB_Te7w2K7T8goz0VQ",
  authDomain: "timotius-web.firebaseapp.com",
  projectId: "timotius-web",
  storageBucket: "timotius-web.firebasestorage.app",
  messagingSenderId: "98455139056",
  appId: "1:98455139056:web:45a85d656cb16396794835"
};

// --- Inisialisasi Firebase (Sudah Benar) ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug');

// --- Komponen Ikon (SVG) ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const GalleryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const HeartIcon = ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${filled ? 'text-red-500' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;


// --- Komponen LoginPage ---
const LoginPage = ({ setNotification }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
                setNotification({ type: 'success', message: 'Registrasi berhasil! Silakan login.' });
                setIsRegistering(false);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            console.error("Authentication error:", error);
            setNotification({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">Selamat Datang</h2>
                    <p className="text-gray-500 mt-2">{isRegistering ? 'Buat akun baru Anda' : 'Login ke akun Anda'}</p>
                </div>
                <form onSubmit={handleAuthAction} className="space-y-6">
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-blue-300"
                    >
                        {loading ? 'Memproses...' : (isRegistering ? 'Daftar' : 'Login')}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    {isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'}
                    <button onClick={() => setIsRegistering(!isRegistering)} className="font-medium text-blue-600 hover:text-blue-500 ml-1">
                        {isRegistering ? 'Login' : 'Daftar'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// --- Komponen Notifikasi ---
const Notification = ({ notification, setNotification }) => {
    if (!notification) return null;

    useEffect(() => {
        const timer = setTimeout(() => {
            setNotification(null);
        }, 5000);
        return () => clearTimeout(timer);
    }, [notification, setNotification]);

    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white z-50 transition-transform transform translate-x-0";
    const typeClasses = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[notification.type]}`}>
            {notification.message}
        </div>
    );
};

// --- Komponen Post ---
const Post = ({ item, currentUser, onLike, onShare, onSelect }) => {
    const hasLiked = item.likes.includes(currentUser?.uid);

    const handleLikeClick = (e) => {
        e.stopPropagation();
        onLike(item.id, hasLiked);
    };
    
    const handleShareClick = (e) => {
        e.stopPropagation();
        onShare(item.id);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 break-inside-avoid-column">
            <div className="p-4 flex items-center">
                <img className="h-10 w-10 rounded-full object-cover" src={`https://i.pravatar.cc/40?u=${item.userId}`} alt="User avatar" />
                <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-800">{item.userId === currentUser?.uid ? 'Saya' : `User ${item.userId.substring(0, 6)}`}</p>
                    <p className="text-xs text-gray-500">{new Date(item.createdAt?.toDate()).toLocaleDateString('id-ID')}</p>
                </div>
            </div>
            <div onClick={() => onSelect(item)} className="cursor-pointer">
                {item.type === 'image' ? (
                     <img className="w-full h-auto object-cover" src={item.url} alt={item.title} onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/e2e8f0/333?text=Image+Not+Found`; }} />
                ) : (
                    <div className="w-full bg-black flex items-center justify-center aspect-video">
                        <p className="text-white">Video Preview</p>
                    </div>
                )}
            </div>
            <div className="p-4">
                <p className="font-bold text-gray-800">{item.title}</p>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
            </div>
            <div className="px-4 py-2 border-t border-gray-200 flex justify-between items-center">
                <div className="flex space-x-4">
                    <button onClick={handleLikeClick} className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition">
                        <HeartIcon filled={hasLiked} />
                        <span>{item.likes.length}</span>
                    </button>
                    <button onClick={handleShareClick} className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition">
                        <ShareIcon />
                        <span>Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Komponen Feed (HomePage) ---
const HomePage = ({ media, currentUser, onLike, onShare, onSelect }) => {
    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Feed Terbaru</h1>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {media.map(item => (
                    <Post key={item.id} item={item} currentUser={currentUser} onLike={onLike} onShare={onShare} onSelect={onSelect} />
                ))}
            </div>
        </div>
    );
};

// --- Komponen GalleryPage ---
const GalleryPage = ({ media, onSelect }) => {
    const [filter, setFilter] = useState({ category: 'all', date: '' });
    const [filteredMedia, setFilteredMedia] = useState(media);

    const categories = ['all', ...new Set(media.map(item => item.category))];

    useEffect(() => {
        let result = media;
        if (filter.category !== 'all') {
            result = result.filter(item => item.category === filter.category);
        }
        if (filter.date) {
            result = result.filter(item => new Date(item.createdAt?.toDate()).toISOString().split('T')[0] === filter.date);
        }
        setFilteredMedia(result);
    }, [filter, media]);

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Galeri Saya</h1>
            <div className="flex flex-wrap gap-4 mb-6 bg-gray-100 p-4 rounded-lg">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Filter Kategori</label>
                    <select id="category" value={filter.category} onChange={e => setFilter({...filter, category: e.target.value})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Filter Tanggal</label>
                    <input type="date" id="date" value={filter.date} onChange={e => setFilter({...filter, date: e.target.value})} className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" />
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMedia.map(item => (
                    <div key={item.id} className="group relative rounded-lg overflow-hidden cursor-pointer" onClick={() => onSelect(item)}>
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-110" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/400x400/e2e8f0/333?text=Error`; }} />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                            <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center p-2">{item.title}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Komponen UploadPage ---
const UploadPage = ({ currentUser, setNotification }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Liburan');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !currentUser) {
            setNotification({ type: 'error', message: 'File dan login diperlukan.' });
            return;
        }
        setLoading(true);

        try {
            // --- Simulasi Upload ---
            const isVideo = file.type.startsWith('video/');
            const placeholderUrl = isVideo 
                ? `https://placehold.co/600x400/1a202c/ffffff?text=Video:+${encodeURIComponent(title)}`
                : `https://placehold.co/600x400/e2e8f0/333?text=${encodeURIComponent(title)}`;
            
            // PERBAIKAN: Menggunakan path 'media' yang sederhana
            const mediaCollectionRef = collection(db, 'media'); 
            await addDoc(mediaCollectionRef, {
                title,
                description,
                category,
                url: placeholderUrl,
                type: isVideo ? 'video' : 'image',
                userId: currentUser.uid,
                createdAt: serverTimestamp(),
                likes: [],
            });

            setNotification({ type: 'success', message: 'Media berhasil diunggah!' });
            setTitle('');
            setDescription('');
            setCategory('Liburan');
            setFile(null);
            setPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (error) {
            console.error("Error uploading media:", error);
            setNotification({ type: 'error', message: `Gagal mengunggah: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Media Baru</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">File Foto/Video</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {preview ? (
                                <img src={preview} alt="Preview" className="mx-auto h-48 w-auto rounded-lg object-contain" />
                            ) : (
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>Pilih file</span>
                                    <input id="file-upload" name="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} className="sr-only" accept="image/*,video/*" />
                                </label>
                                <p className="pl-1">atau tarik dan lepas</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 10MB. MP4, WEBM.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option>Liburan</option>
                        <option>Keluarga</option>
                        <option>Pekerjaan</option>
                        <option>Hobi</option>
                        <option>Lainnya</option>
                    </select>
                </div>

                <div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                        {loading ? 'Mengunggah...' : 'Kirim'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Komponen Lightbox Modal ---
const LightboxModal = ({ item, onClose }) => {
    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-gray-300">
                    <CloseIcon />
                </button>
                {item.type === 'image' ? (
                    <img src={item.url} alt={item.title} className="w-full h-full object-contain rounded-lg" />
                ) : (
                    <div className="w-full bg-black flex items-center justify-center aspect-video rounded-lg">
                        <h2 className="text-white text-2xl">Video Player: {item.title}</h2>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Komponen Utama App ---
export default function App() {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [page, setPage] = useState('home');
    const [media, setMedia] = useState([]);
    const [loadingMedia, setLoadingMedia] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [notification, setNotification] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Efek untuk autentikasi
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    // Efek untuk mengambil data media dari Firestore
    useEffect(() => {
        // PERBAIKAN: Menggunakan path 'media' yang sederhana
        const mediaCollectionRef = collection(db, 'media');
        const q = query(mediaCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const mediaList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMedia(mediaList);
            setLoadingMedia(false);
        }, (error) => {
            console.error("Error fetching media:", error);
            setNotification({ type: 'error', message: 'Gagal memuat data galeri.' });
            setLoadingMedia(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setPage('home');
        setNotification({ type: 'info', message: 'Anda telah logout.' });
    };

    const handleLike = async (itemId, hasLiked) => {
        if (!user) {
            setNotification({ type: 'error', message: 'Silakan login untuk menyukai post.' });
            return;
        }
        // PERBAIKAN: Menggunakan path 'media' yang sederhana
        const itemRef = doc(db, 'media', itemId);
        try {
            if (hasLiked) {
                await updateDoc(itemRef, {
                    likes: arrayRemove(user.uid)
                });
            } else {
                await updateDoc(itemRef, {
                    likes: arrayUnion(user.uid)
                });
            }
        } catch (error) {
            console.error("Error updating like:", error);
            setNotification({ type: 'error', message: 'Gagal memperbarui suka.' });
        }
    };
    
    const handleShare = (itemId) => {
        const url = `${window.location.href}#item/${itemId}`;
        navigator.clipboard.writeText(url)
            .then(() => setNotification({ type: 'success', message: 'Link telah disalin ke clipboard!' }))
            .catch(() => setNotification({ type: 'error', message: 'Gagal menyalin link.' }));
    };

    const renderPage = () => {
        if (loadingMedia) {
            return <div className="flex justify-center items-center h-full"><p>Memuat data...</p></div>;
        }
        switch (page) {
            case 'home':
                return <HomePage media={media} currentUser={user} onLike={handleLike} onShare={handleShare} onSelect={setSelectedItem} />;
            case 'gallery':
                const userMedia = media.filter(m => m.userId === user?.uid);
                return <GalleryPage media={user ? userMedia : []} onSelect={setSelectedItem} />;
            case 'videos':
                 const videos = media.filter(item => item.type === 'video');
                return <GalleryPage media={videos} onSelect={setSelectedItem} />;
            case 'upload':
                if (!user) {
                    return <div className="p-8 text-center"><p className="text-red-500">Anda harus login untuk mengupload media.</p></div>
                }
                return <UploadPage currentUser={user} setNotification={setNotification} />;
            case 'settings':
                return <div className="p-8"><h1 className="text-2xl">Halaman Pengaturan</h1><p>Email: {user?.email}</p><p>User ID: {user?.uid}</p></div>;
            default:
                return <HomePage media={media} currentUser={user} onLike={handleLike} onShare={handleShare} onSelect={setSelectedItem} />;
        }
    };

    const NavLink = ({ icon, label, pageName }) => (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                setPage(pageName);
                setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors duration-200 ${page === pageName ? 'bg-blue-100 text-blue-600 font-semibold' : ''}`}
        >
            {icon}
            <span className="ml-4">{label}</span>
        </a>
    );

    if (loadingAuth) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Memuat aplikasi...</p></div>;
    }
    
    // Logika untuk menampilkan halaman login
    if (!user) {
        return (
            <>
                <Notification notification={notification} setNotification={setNotification} />
                <LoginPage setNotification={setNotification} />
            </>
        );
    }
    
    // Tampilan utama setelah login
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Notification notification={notification} setNotification={setNotification} />
            <LightboxModal item={selectedItem} onClose={() => setSelectedItem(null)} />

            <div className="flex">
                <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-8 px-4">GaleriKu</div>
                    <nav className="flex-grow space-y-2">
                        <NavLink icon={<HomeIcon />} label="Home" pageName="home" />
                        <NavLink icon={<GalleryIcon />} label="Galeri Saya" pageName="gallery" />
                        <NavLink icon={<VideoIcon />} label="Video" pageName="videos" />
                        <NavLink icon={<UploadIcon />} label="Upload" pageName="upload" />
                        <NavLink icon={<SettingsIcon />} label="Pengaturan" pageName="settings" />
                    </nav>
                    <div className="mt-auto">
                         <a href="#" onClick={handleLogout} className="flex items-center px-4 py-3 text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors duration-200">
                            <LogoutIcon />
                            <span className="ml-4">Logout</span>
                        </a>
                    </div>
                </aside>

                <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
                <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-4 z-40 transform transition-transform md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                     <div className="text-2xl font-bold text-blue-600 mb-8 px-4">GaleriKu</div>
                    <nav className="flex-grow space-y-2">
                        <NavLink icon={<HomeIcon />} label="Home" pageName="home" />
                        <NavLink icon={<GalleryIcon />} label="Galeri Saya" pageName="gallery" />
                        <NavLink icon={<VideoIcon />} label="Video" pageName="videos" />
                        <NavLink icon={<UploadIcon />} label="Upload" pageName="upload" />
                        <NavLink icon={<SettingsIcon />} label="Pengaturan" pageName="settings" />
                    </nav>
                    <div className="mt-auto">
                         <a href="#" onClick={handleLogout} className="flex items-center px-4 py-3 text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors duration-200">
                            <LogoutIcon />
                            <span className="ml-4">Logout</span>
                        </a>
                    </div>
                </aside>
                
                <main className="flex-1">
                    <header className="md:hidden sticky top-0 bg-white shadow-sm z-20 flex items-center justify-between p-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="text-xl font-bold text-blue-600">GaleriKu</div>
                        <div className="w-6"></div>
                    </header>
                    
                     <header className="hidden md:flex sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-10 items-center justify-end p-4">
                        <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700 mr-3">{user?.email}</span>
                            <img className="h-10 w-10 rounded-full object-cover" src={`https://i.pravatar.cc/40?u=${user?.uid}`} alt="User avatar" />
                        </div>
                    </header>

                    <div className="w-full">
                        {renderPage()}
                    </div>
                </main>
            </div>
        </div>
    );
}

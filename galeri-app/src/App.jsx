import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import {
    getFirestore,
    getDoc, 
   setDoc,
    collection,
    addDoc,
    query,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    orderBy,
    serverTimestamp,
    where,
    getDocs
} from 'firebase/firestore';
import axios from 'axios';

// --- Konfigurasi Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyDk4SMx8BXldMFJfkB_Te7w2K7T8goz0VQ",
    authDomain: "timotius-web.firebaseapp.com",
    projectId: "timotius-web",
    storageBucket: "timotius-web.firebasestorage.app",
    messagingSenderId: "98455139056",
    appId: "1:98455139056:web:45a85d656cb16396794835"
};

// --- Inisialisasi Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Konfigurasi Cloudinary ---
const CLOUDINARY_CLOUD_NAME = "dk4ltjljk";
const CLOUDINARY_UPLOAD_PRESET = "Timotius-web";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

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
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

// --- Komponen LoginPage ---
const LoginPage = ({ setNotification, onLoginSuccess }) => {
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
                if(onLoginSuccess) onLoginSuccess();
            }
        } catch (error) {
            console.error("Authentication error:", error);
            setNotification({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[60] flex flex-col justify-center items-center p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">Selamat Datang</h2>
                    <p className="text-gray-500 mt-2">{isRegistering ? 'Buat akun baru Anda' : 'Login untuk melanjutkan'}</p>
                </div>
                <form onSubmit={handleAuthAction} className="space-y-6">
                    <div className="relative">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"/>
                    </div>
                    <div className="relative">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"/>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-blue-300">
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
    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white z-[100] transition-transform transform translate-x-0";
    const typeClasses = { success: "bg-green-500", error: "bg-red-500", info: "bg-blue-500" };
    return (<div className={`${baseClasses} ${typeClasses[notification.type]}`}>{notification.message}</div>);
};

// --- Komponen Post ---
const Post = ({ item, currentUser, onLike, onShare, onSelect }) => {
    const hasLiked = currentUser && item.likes.includes(currentUser.uid);
    const handleLikeClick = (e) => { e.stopPropagation(); onLike(item.id, hasLiked); };
    const handleShareClick = (e) => { e.stopPropagation(); onShare(item.id); };
    const renderMedia = () => {
        if (item.type === 'image') {
            return <img className="w-full h-auto object-cover" src={item.url} alt={item.title} onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/e2e8f0/333?text=Image+Error`; }} />;
        }
        if (item.type === 'video') {
            return <video className="w-full h-auto object-cover bg-black" controls src={item.url} />;
        }
        return <div className="w-full bg-gray-200 aspect-video flex items-center justify-center"><p>{item.title}</p></div>
    }
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 break-inside-avoid-column">
            <div className="p-4 flex items-center">
                <img className="h-10 w-10 rounded-full object-cover" src={item.photoURL || `https://i.pravatar.cc/40?u=${item.userId}`} alt="User avatar" />
                <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-800">{item.displayName || (item.userId === currentUser?.uid ? 'Saya' : `User`)}</p>
                    <p className="text-xs text-gray-500">{new Date(item.createdAt?.toDate()).toLocaleDateString('id-ID')}</p>
                </div>
            </div>
            <div onClick={() => onSelect(item)} className="cursor-pointer">{renderMedia()}</div>
            <div className="p-4">
                <p className="font-bold text-gray-800">{item.title}</p>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
            </div>
            <div className="px-4 py-2 border-t border-gray-200 flex justify-between items-center">
                <div className="flex space-x-4">
                    <button onClick={handleLikeClick} className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition"><HeartIcon filled={hasLiked} /><span>{item.likes.length}</span></button>
                    <button onClick={handleShareClick} className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition"><ShareIcon /><span>Share</span></button>
                </div>
            </div>
        </div>
    );
};

// --- Komponen HomePage & GalleryPage ---
const HomePage = ({ media, currentUser, onLike, onShare, onSelect, pageTitle }) => (
    <div className="p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{pageTitle}</h1>
        {media.length === 0 ? <p className="text-gray-500">Belum ada media di sini.</p> : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {media.map(item => <Post key={item.id} item={item} currentUser={currentUser} onLike={onLike} onShare={onShare} onSelect={onSelect} />)}
            </div>
        )}
    </div>
);

const GalleryPage = ({ media, onSelect, onDelete, onEdit, pageTitle, userHeader }) => (
    <div className="p-4 md:p-6 lg:p-8">
        {userHeader && (
            <div className="mb-8">
                <img src={userHeader} alt="User Header" className="w-full h-48 object-cover rounded-xl shadow-lg" />
            </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{pageTitle}</h1>
        {media.length === 0 ? <p className="text-gray-500">Anda belum mengunggah media apapun di kategori ini.</p> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {media.map(item => (
                    <div key={item.id} className="group relative rounded-lg overflow-hidden" onClick={() => onSelect(item)}>
                        {item.type === 'image' ? <img src={item.url} alt={item.title} className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-110" /> : <video src={item.url} className="w-full h-full object-cover aspect-square bg-black"></video>}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex flex-col justify-end p-2">
                            <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">{item.title}</p>
                            <div className="flex justify-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                    className="p-2 bg-white/20 rounded-full hover:bg-white/40 text-white"
                                    title="Edit">
                                    <EditIcon />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                    className="p-2 bg-red-500/80 rounded-full hover:bg-red-600/80 text-white"
                                    title="Hapus">
                                    <DeleteIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// --- Komponen UploadPage ---
const UploadPage = ({ currentUser, setNotification, onUploadComplete, categories }) => {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(categories[0]?.label || 'Uncategorized');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef();

    useEffect(() => {
        if (categories.length > 0) {
            setCategory(categories[0].label);
        }
    }, [categories]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        previews.forEach(url => URL.revokeObjectURL(url));
        const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(previewUrls);
    };

    const resetForm = () => {
        setFiles([]); setPreviews([]); setTitle(''); setDescription(''); setCategory(categories[0]?.label || 'Uncategorized'); setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0 || !currentUser) { setNotification({ type: 'error', message: 'Pilih minimal satu file.' }); return; }
        setLoading(true); setUploadProgress(0);
        
        let uploadedCount = 0;
        const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            try {
                const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
                    onUploadProgress: progressEvent => {
                        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setUploadProgress(progress);
                    }
                });

                const downloadUrl = response.data.secure_url;
                await addDoc(collection(db, 'media'), {
                    title: files.length === 1 ? title || file.name : file.name,
                    description: files.length === 1 ? description : "",
                    category,
                    url: downloadUrl,
                    type: file.type.startsWith('image') ? 'image' : 'video',
                    userId: currentUser.uid,
                    photoURL: currentUser.photoURL,
                    createdAt: serverTimestamp(),
                    likes: [],
                });
                uploadedCount++;
                setUploadProgress(Math.round((uploadedCount / files.length) * 100));

            } catch (error) {
                console.error("Error uploading one file:", error);
                throw new Error(`Gagal mengunggah ${file.name}`);
            }
        });
        
        try {
            await Promise.all(uploadPromises);
            setNotification({ type: 'success', message: `${files.length} media berhasil diunggah!` });
            resetForm();
            if (onUploadComplete) onUploadComplete();
        } catch (error) {
            console.error("Error during bulk upload:", error);
            setNotification({ type: 'error', message: `${error.message}.` });
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
                            {previews.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-4 p-4">
                                    {previews.map((src, index) => ( files[index].type.startsWith('video/') ? <video key={src} src={src} className="h-24 w-auto rounded-lg object-contain bg-gray-200" /> : <img key={src} src={src} alt="Preview" className="h-24 w-auto rounded-lg object-contain" /> ))}
                                </div>
                            ) : ( <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg> )}
                            <div className="flex text-sm text-gray-600 justify-center">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"><span>Pilih file</span><input id="file-upload" name="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} className="sr-only" accept="image/*,video/*" multiple /></label>
                            </div>
                            <p className="text-xs text-gray-500">{files.length > 0 ? `${files.length} file dipilih` : 'PNG, JPG, MP4, dll.'}</p>
                        </div>
                    </div>
                </div>
                {files.length === 1 && (
                    <>
                        <div><label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul (Opsional)</label><input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder={`Default: ${files[0]?.name}`} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                        <div><label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                    </>
                )}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
                        {categories.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                    </select>
                </div>
                {loading && ( <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div></div> )}
                <div><button type="submit" disabled={loading || files.length === 0} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300">{loading ? `Mengunggah... ${uploadProgress}%` : `Kirim ${files.length} File`}</button></div>
            </form>
        </div>
    );
};

// --- Komponen SettingsPage ---
const SettingsPage = ({ user, setNotification, categories, onAddCategory, onEditCategory, onDeleteCategory, onUserUpdate, onUpdateUserHeader }) => {
    const [newCategoryLabel, setNewCategoryLabel] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [editCategoryLabel, setEditCategoryLabel] = useState("");
    const [profileFile, setProfileFile] = useState(null);
    const [headerFile, setHeaderFile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingHeader, setLoadingHeader] = useState(false);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryLabel.trim()) return;
        await onAddCategory(newCategoryLabel.trim());
        setNewCategoryLabel("");
        setNotification({ type: 'success', message: 'Kategori baru berhasil ditambahkan!' });
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        if (!editCategoryLabel.trim()) return;
        await onEditCategory(editingCategory.id, editCategoryLabel.trim());
        setEditingCategory(null);
        setEditCategoryLabel("");
        setNotification({ type: 'success', message: 'Kategori berhasil diubah!' });
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm("Anda yakin ingin menghapus kategori ini?")) {
            await onDeleteCategory(categoryId);
            setNotification({ type: 'info', message: 'Kategori telah dihapus.' });
        }
    };

    const handleProfileFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
        }
    };

    const handleHeaderFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHeaderFile(file);
        }
    };

    const handleUploadProfile = async () => {
        if (!profileFile || !user) return;
        setLoadingProfile(true);
        const formData = new FormData();
        formData.append('file', profileFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        try {
            const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
            const photoURL = response.data.secure_url;
            await updateProfile(user, { photoURL });
            onUserUpdate({ ...user, photoURL });
            setNotification({ type: 'success', message: 'Foto profil berhasil diunggah!' });
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            setNotification({ type: 'error', message: 'Gagal mengunggah foto profil.' });
        } finally {
            setLoadingProfile(false);
            setProfileFile(null);
        }
    };
    
    const handleUploadHeader = async () => {
        if (!headerFile || !user) return;
        setLoadingHeader(true);
        const formData = new FormData();
        formData.append('file', headerFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        try {
            const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
            const headerURL = response.data.secure_url;
            
            // Simpan URL header di koleksi pengguna di Firestore
           const userDocRef = doc(db, 'users', user.uid);
await setDoc(userDocRef, { headerURL }, { merge: true });
            
            onUpdateUserHeader(headerURL);
            setNotification({ type: 'success', message: 'Gambar header berhasil diunggah!' });
        } catch (error) {
            console.error("Error uploading header image:", error);
            setNotification({ type: 'error', message: 'Gagal mengunggah gambar header.' });
        } finally {
            setLoadingHeader(false);
            setHeaderFile(null);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Pengaturan</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-700">Akun Saya</h2>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>User ID:</strong> {user?.uid}</p>
                </div>
                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Ubah Foto Profil</h2>
                    <div className="flex items-center space-x-4">
                        <img
                            src={user?.photoURL || `https://i.pravatar.cc/100?u=${user?.uid}`}
                            alt="Foto Profil"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                        <input type="file" onChange={handleProfileFileChange} accept="image/*" className="text-sm text-gray-600"/>
                        <button
                            onClick={handleUploadProfile}
                            disabled={!profileFile || loadingProfile}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                            {loadingProfile ? "Mengunggah..." : "Ganti Foto"}
                        </button>
                    </div>
                </div>
                {/* Bagian baru untuk ganti header */}
                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Ubah Gambar Header</h2>
                    <div className="flex items-center space-x-4">
                        <input type="file" onChange={handleHeaderFileChange} accept="image/*" className="text-sm text-gray-600"/>
                        <button
                            onClick={handleUploadHeader}
                            disabled={!headerFile || loadingHeader}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                            {loadingHeader ? "Mengunggah..." : "Ganti Header"}
                        </button>
                    </div>
                    {user?.headerURL && (
                        <div className="mt-4">
                            <img src={user.headerURL} alt="Header Preview" className="w-full h-32 object-cover rounded-lg"/>
                        </div>
                    )}
                </div>
                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-700">Kelola Kategori Media</h2>
                    <form onSubmit={handleAddCategory} className="flex gap-2 mb-4 mt-4">
                        <input
                            type="text"
                            value={newCategoryLabel}
                            onChange={(e) => setNewCategoryLabel(e.target.value)}
                            placeholder="Nama Kategori Baru"
                            className="flex-grow block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                            <AddIcon />
                        </button>
                    </form>
                    <h3 className="text-lg font-medium text-gray-600 mt-6">Daftar Kategori Anda:</h3>
                    <ul className="space-y-2 mt-2">
                        {categories.map(cat => (
                            <li key={cat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                {editingCategory?.id === cat.id ? (
                                    <form onSubmit={handleEditCategory} className="flex flex-grow gap-2">
                                        <input
                                            type="text"
                                            value={editCategoryLabel}
                                            onChange={(e) => setEditCategoryLabel(e.target.value)}
                                            className="flex-grow block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
                                        <button type="submit" className="text-green-500 hover:text-green-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
                                        <button onClick={() => {setEditingCategory(null); setEditCategoryLabel("")}} className="text-gray-500 hover:text-gray-700"><CloseIcon /></button>
                                    </form>
                                ) : (
                                    <>
                                        <span>{cat.label}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => {setEditingCategory(cat); setEditCategoryLabel(cat.label)}} className="text-blue-500 hover:text-blue-700"><EditIcon /></button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700"><DeleteIcon /></button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


// --- Komponen Lightbox Modal ---
const LightboxModal = ({ item, user, onClose, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    useEffect(() => {
        if (item) { setEditTitle(item.title); setEditDescription(item.description); }
        else { setIsEditing(false); }
    }, [item]);

    if (!item) return null;
    const isOwner = user && user.uid === item.userId;
    const handleSave = () => { onUpdate(item.id, { title: editTitle, description: editDescription }); setIsEditing(false); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col gap-4 overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 flex justify-end absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="text-white bg-black/30 rounded-full p-1 hover:bg-black/60"><CloseIcon /></button>
                </div>
                <div className="flex-grow w-full h-full flex items-center justify-center">
                    {item.type === 'image' ? <img src={item.url} alt={item.title} className="max-w-full max-h-full object-contain rounded-lg" /> : <video src={item.url} controls className="max-w-full max-h-full object-contain rounded-lg bg-black" />}
                </div>
                <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm p-4 rounded-lg text-white">
                    {isEditing ? (
                        <div className="space-y-2">
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded" placeholder="Judul"/>
                            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded" placeholder="Deskripsi"></textarea>
                            <div className="flex gap-2"><button onClick={handleSave} className="bg-blue-600 px-3 py-1 rounded">Simpan</button><button onClick={() => setIsEditing(false)} className="bg-gray-500 px-3 py-1 rounded">Batal</button></div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start">
                            <div><h3 className="font-bold text-xl">{item.title}</h3><p>{item.description}</p></div>
                            {isOwner && (
                                <div className="flex gap-3 flex-shrink-0 ml-4">
                                    <button onClick={() => setIsEditing(true)} className="p-2 bg-white/20 rounded-full hover:bg-white/40" title="Edit"><EditIcon /></button>
                                    <button onClick={() => onDelete(item.id)} className="p-2 bg-white/20 rounded-full hover:bg-white/40" title="Hapus"><DeleteIcon /></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
    const [categories, setCategories] = useState([]);
    const [showLogin, setShowLogin] = useState(false);
    const [userHeader, setUserHeader] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Periksa apakah dokumen pengguna sudah ada di Firestore
               const userDocRef = doc(db, 'users', currentUser.uid);
const userDocSnap = await getDoc(userDocRef); // Gunakan getDoc()

let headerURL = null;
if (userDocSnap.exists()) { // Gunakan userDocSnap.exists()
    headerURL = userDocSnap.data().headerURL;
}
                
                // Tambahkan headerURL ke objek user
                setUser({ ...currentUser, headerURL });
                setUserHeader(headerURL);

            } else {
                setUser(null);
                setUserHeader(null);
            }
            setShowLogin(false);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) { setCategories([]); return; };
        const q = query(collection(db, 'categories'), where("userId", "==", user.uid), orderBy('label'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => { console.error("Error fetching categories:", error); setNotification({type: "error", message:"Gagal memuat kategori."})});
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        const mediaCollectionRef = collection(db, 'media');
        const q = query(mediaCollectionRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setMedia(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoadingMedia(false);
        }, (error) => { console.error("Error fetching media:", error); setLoadingMedia(false); });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setPage('home');
        setNotification({ type: 'info', message: 'Anda telah logout.' });
        setShowLogin(true);
    };

    const handleLike = async (itemId, hasLiked) => {
        if (!user) { setShowLogin(true); return; }
        const itemRef = doc(db, 'media', itemId);
        await updateDoc(itemRef, { likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
    };
    
    const handleShare = (itemId) => {
        navigator.clipboard.writeText(`${window.location.href}#item/${itemId}`)
            .then(() => setNotification({ type: 'success', message: 'Link telah disalin!' }))
            .catch(() => setNotification({ type: 'error', message: 'Gagal menyalin link.' }));
    };

    const handleDeleteMedia = async (itemId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus media ini?")) {
            await deleteDoc(doc(db, 'media', itemId));
            setNotification({ type: 'info', message: 'Media berhasil dihapus.' });
            setSelectedItem(null);
        }
    };

    const handleUpdateMedia = async (itemId, data) => {
        const itemRef = doc(db, 'media', itemId);
        await updateDoc(itemRef, data);
        setNotification({ type: 'success', message: 'Media berhasil diperbarui.' });
        setSelectedItem(selectedItem ? { ...selectedItem, ...data } : null);
    };

    const handleAddCategory = async (label) => {
        if (!user) return;
        await addDoc(collection(db, 'categories'), { label: label, userId: user.uid });
    };

    const handleEditCategory = async (categoryId, newLabel) => {
        if (!user) return;
        await updateDoc(doc(db, 'categories', categoryId), { label: newLabel });
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!user) return;
        await deleteDoc(doc(db, 'categories', categoryId));
    };

    const handleNavigation = (pageName) => {
        const categoryPage = categories.find(cat => cat.label === pageName);
        if (['gallery', 'videos', 'upload', 'settings'].includes(pageName) && !user) { setShowLogin(true); return; }
        if (categoryPage && !user) { setShowLogin(true); return; }

        setPage(pageName);
        setIsSidebarOpen(false);
    }
    
    const renderPage = () => {
        if (loadingMedia) { return <div className="flex justify-center items-center h-full p-8"><p>Memuat data...</p></div>; }
        
        const selectedCategory = categories.find(cat => cat.label === page);
        if (selectedCategory) {
            const categorizedMedia = media.filter(m => m.userId === user?.uid && m.category === selectedCategory.label);
            return <GalleryPage
                media={categorizedMedia}
                onSelect={setSelectedItem}
                onEdit={(item) => setSelectedItem(item)}
                onDelete={handleDeleteMedia}
                pageTitle={`Kategori: ${selectedCategory.label}`}
                userHeader={userHeader}
            />;
        }
        
        switch (page) {
            case 'home': return <HomePage media={media} currentUser={user} onLike={handleLike} onShare={handleShare} onSelect={setSelectedItem} pageTitle="Feed Terbaru" />;
            case 'gallery': return <GalleryPage media={media.filter(m => m.userId === user?.uid)} onSelect={setSelectedItem} onEdit={(item) => setSelectedItem(item)} onDelete={handleDeleteMedia} pageTitle="Galeri Saya" userHeader={userHeader} />;
            case 'videos': return <GalleryPage media={media.filter(m => m.userId === user?.uid && m.type === 'video')} onSelect={setSelectedItem} onEdit={(item) => setSelectedItem(item)} onDelete={handleDeleteMedia} pageTitle="Video Saya" userHeader={userHeader} />;
            case 'upload': return <UploadPage currentUser={user} setNotification={setNotification} onUploadComplete={() => setPage('gallery')} categories={categories} />;
            case 'settings': return <SettingsPage 
                user={user} 
                setNotification={setNotification} 
                categories={categories} 
                onAddCategory={handleAddCategory} 
                onEditCategory={handleEditCategory} 
                onDeleteCategory={handleDeleteCategory} 
                onUserUpdate={setUser} 
                onUpdateUserHeader={setUserHeader}
            />;
            default: return <HomePage media={media} currentUser={user} onLike={handleLike} onShare={handleShare} onSelect={setSelectedItem} pageTitle="Feed Terbaru" />;
        }
    };

    const NavLink = ({ icon, label, pageName }) => (
        <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation(pageName); }} className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors duration-200 ${page === pageName ? 'bg-blue-100 text-blue-600 font-semibold' : ''}`}>{icon}<span className="ml-4">{label}</span></a>
    );

    if (loadingAuth) { return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Memuat aplikasi...</p></div>; }
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Notification notification={notification} setNotification={setNotification} />
            <LightboxModal item={selectedItem} user={user} onClose={() => setSelectedItem(null)} onUpdate={handleUpdateMedia} onDelete={handleDeleteMedia} />
            {showLogin && <LoginPage setNotification={setNotification} onLoginSuccess={() => setShowLogin(false)} />}
            <div className="flex">
                <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-8 px-4">Timotius SU</div>
                    <nav className="flex-grow space-y-2">
                        <NavLink icon={<HomeIcon />} label="Home" pageName="home" />
                        {user && ( <>
                            <NavLink icon={<GalleryIcon />} label="Galeri Saya" pageName="gallery" />
                            <NavLink icon={<VideoIcon />} label="Video" pageName="videos" />
                            <NavLink icon={<UploadIcon />} label="Upload" pageName="upload" />
                            <hr className="my-4" />
                            <div className="px-4 text-sm font-semibold text-gray-400">KATEGORI</div>
                            {categories.map(cat => ( <NavLink key={cat.id} icon={<MenuIcon />} label={cat.label} pageName={cat.label} /> ))}
                            <hr className="my-4" />
                            <NavLink icon={<SettingsIcon />} label="Pengaturan" pageName="settings" />
                        </> )}
                    </nav>
                    {user && ( <div className="mt-auto"><a href="#" onClick={handleLogout} className="flex items-center px-4 py-3 text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-lg"><LogoutIcon /><span className="ml-4">Logout</span></a></div> )}
                </aside>
                <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
                <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-4 z-40 transform transition-transform md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="text-2xl font-bold text-blue-600 mb-8 px-4">GaleriKu</div>
                    <nav className="flex-grow space-y-2">
                        <NavLink icon={<HomeIcon />} label="Home" pageName="home" />
                        {user && ( <>
                            <NavLink icon={<GalleryIcon />} label="Galeri Saya" pageName="gallery" />
                            <NavLink icon={<VideoIcon />} label="Video" pageName="videos" />
                            <NavLink icon={<UploadIcon />} label="Upload" pageName="upload" />
                            <hr className="my-4" />
                            <div className="px-4 text-sm font-semibold text-gray-400">KATEGORI</div>
                            {categories.map(cat => ( <NavLink key={cat.id} icon={<MenuIcon />} label={cat.label} pageName={cat.label} /> ))}
                            <hr className="my-4" />
                            <NavLink icon={<SettingsIcon />} label="Pengaturan" pageName="settings" />
                        </> )}
                    </nav>
                    {user && ( <div className="mt-auto"><a href="#" onClick={handleLogout} className="flex items-center px-4 py-3 text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-lg"><LogoutIcon /><span className="ml-4">Logout</span></a></div> )}
                </aside>
                <main className="flex-1">
                    <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-10 flex items-center justify-between p-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 md:hidden"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                        <div className="text-xl font-bold text-blue-600 md:hidden">GaleriKu</div>
                        <div className="flex-grow"></div>
                        <div className="flex items-center">
                            {user ? ( <>
                                <span className="text-sm font-medium text-gray-700 mr-3 hidden sm:block">{user.email}</span>
                                <img className="h-10 w-10 rounded-full object-cover" src={user.photoURL || `https://i.pravatar.cc/40?u=${user.uid}`} alt="User avatar" />
                            </> ) : ( <button onClick={() => setShowLogin(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm">Login / Daftar</button> )}
                        </div>
                    </header>
                    <div className="w-full">{renderPage()}</div>
                </main>
            </div>
        </div>
    );
}

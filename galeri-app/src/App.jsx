import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
} from 'firebase/auth';
import { 
    getFirestore, 
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
    where
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

    const handleLikeClick = (e) => {
        e.stopPropagation();
        onLike(item.id, hasLiked);
    };
    
    const handleShareClick = (e) => {
        e.stopPropagation();
        onShare(item.id);
    };

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
                <img className="h-10 w-10 rounded-full object-cover" src={`https://i.pravatar.cc/40?u=${item.userId}`} alt="User avatar" />
                <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-800">{item.userId === currentUser?.uid ? 'Saya' : `User`}</p>
                    <p className="text-xs text-gray-500">{new Date(item.createdAt?.toDate()).toLocaleDateString('id-ID')}</p>
                </div>
            </div>
            <div onClick={() => onSelect(item)} className="cursor-pointer">
                {renderMedia()}
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

// --- Komponen HomePage (untuk Feed) ---
const HomePage = ({ media, currentUser, onLike, onShare, onSelect, pageTitle }) => {
    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{pageTitle}</h1>
            {media.length === 0 ? (
                <p className="text-gray-500">Belum ada media di sini.</p>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                    {media.map(item => (
                        <Post key={item.id} item={item} currentUser={currentUser} onLike={onLike} onShare={onShare} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Komponen GalleryPage (untuk Galeri & Video) ---
const GalleryPage = ({ media, onSelect, pageTitle }) => {
    return (
      <div className="p-4 md:p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{pageTitle}</h1>
           {media.length === 0 ? (
                <p className="text-gray-500">Anda belum mengunggah media apapun di kategori ini.</p>
           ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {media.map(item => (
                        <div key={item.id} className="group relative rounded-lg overflow-hidden cursor-pointer" onClick={() => onSelect(item)}>
                            {item.type === 'image' ? (
                                <img src={item.url} alt={item.title} className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-110" />
                            ) : (
                                <video src={item.url} className="w-full h-full object-cover aspect-square bg-black"></video>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center p-2">
                                <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">{item.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Komponen UploadPage ---
const UploadPage = ({ currentUser, setNotification, onUploadComplete }) => {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Liburan');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef();

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        previews.forEach(url => URL.revokeObjectURL(url));
        const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(previewUrls);
    };

    const resetForm = () => {
        setFiles([]);
        setPreviews([]);
        setTitle('');
        setDescription('');
        setCategory('Liburan');
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0 || !currentUser) {
            setNotification({ type: 'error', message: 'Pilih minimal satu file untuk diunggah.' });
            return;
        }
        setLoading(true);
        setUploadProgress(0);

        let uploadedCount = 0;

        const uploadPromises = files.map(async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                const res = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
                const { secure_url, resource_type } = res.data;

                const mediaCollectionRef = collection(db, 'media');
                await addDoc(mediaCollectionRef, {
                    title: files.length === 1 ? title || file.name : file.name,
                    description: files.length === 1 ? description : "",
                    category,
                    url: secure_url,
                    type: resource_type,
                    userId: currentUser.uid,
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
            setNotification({ type: 'error', message: `${error.message}. Beberapa file mungkin tidak terunggah.` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Media Baru</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">File Foto/Video (Bisa lebih dari satu)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {previews.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-4 p-4">
                                    {previews.map((src, index) => (
                                        files[index].type.startsWith('video/')
                                        ? <video key={src} src={src} className="h-24 w-auto rounded-lg object-contain bg-gray-200" />
                                        : <img key={src} src={src} alt="Preview" className="h-24 w-auto rounded-lg object-contain" />
                                    ))}
                                </div>
                            ) : (
                                 <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                            )}
                            <div className="flex text-sm text-gray-600 justify-center">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                    <span>Pilih file</span>
                                    <input id="file-upload" name="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} className="sr-only" accept="image/*,video/*" multiple />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">{files.length > 0 ? `${files.length} file dipilih` : 'PNG, JPG, MP4, dll.'}</p>
                        </div>
                    </div>
                </div>

                {files.length === 1 && (
                    <>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul (Opsional)</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder={`Default: ${files[0]?.name}`} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                    </>
                )}

                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
                        <option>Liburan</option>
                        <option>Keluarga</option>
                        <option>Pekerjaan</option>
                        <option>Hobi</option>
                        <option>Lainnya</option>
                    </select>
                </div>
                
                {loading && (
                     <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}

                <div>
                    <button type="submit" disabled={loading || files.length === 0} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300">
                        {loading ? `Mengunggah... ${uploadProgress}%` : `Kirim ${files.length} File`}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Komponen SettingsPage ---
const SettingsPage = ({ user, setNotification }) => {
    const [menus, setMenus] = useState([]);
    const [newMenuLabel, setNewMenuLabel] = useState("");
    const [loading, setLoading] = useState(true);
    const menusCollectionRef = collection(db, 'menus');

    useEffect(() => {
        if (!user) return;
        const q = query(menusCollectionRef, where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const menuList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMenus(menuList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleAddMenu = async (e) => {
        e.preventDefault();
        if (!newMenuLabel.trim()) return;
        const pageName = newMenuLabel.trim().toLowerCase().replace(/\s+/g, '-');
        await addDoc(menusCollectionRef, {
            label: newMenuLabel.trim(),
            pageName: `custom-${pageName}`,
            userId: user.uid,
        });
        setNewMenuLabel("");
        setNotification({type: 'success', message: 'Menu baru berhasil ditambahkan!'});
    };

    const handleDeleteMenu = async (menuId) => {
        if (window.confirm("Anda yakin ingin menghapus menu ini?")) {
            const menuDoc = doc(db, 'menus', menuId);
            await deleteDoc(menuDoc);
            setNotification({type: 'info', message: 'Menu telah dihapus.'});
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
                    <h2 className="text-xl font-semibold text-gray-700">Kelola Menu Kustom</h2>
                    <p className="text-sm text-gray-500 mb-4">Tambahkan menu baru seperti "Food Holiday Bandung". Menu ini akan muncul di sidebar.</p>
                    <form onSubmit={handleAddMenu} className="flex gap-2 mb-4">
                        <input type="text" value={newMenuLabel} onChange={(e) => setNewMenuLabel(e.target.value)} placeholder="Nama Menu Baru" className="flex-grow block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Tambah</button>
                    </form>
                    <h3 className="text-lg font-medium text-gray-600 mt-6">Daftar Menu Anda:</h3>
                    {loading ? <p>Memuat menu...</p> : (
                        <ul className="space-y-2 mt-2">
                            {menus.map(menu => (
                                <li key={menu.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                    <span>{menu.label}</span>
                                    <button onClick={() => handleDeleteMenu(menu.id)} className="text-red-500 hover:text-red-700"><DeleteIcon /></button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Komponen Lightbox Modal ---
const LightboxModal = ({ item, user, onClose, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    useEffect(() => {
        if (item) {
            setEditTitle(item.title);
            setEditDescription(item.description);
        } else {
            setIsEditing(false);
        }
    }, [item]);

    if (!item) return null;

    const isOwner = user && user.uid === item.userId;

    const handleSave = () => {
        onUpdate(item.id, { title: editTitle, description: editDescription });
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 flex justify-end">
                     <button onClick={onClose} className="text-white hover:text-gray-300"><CloseIcon /></button>
                </div>
                <div className="flex-grow w-full h-full flex items-center justify-center">
                    {item.type === 'image' ? (
                        <img src={item.url} alt={item.title} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
                    ) : (
                        <video src={item.url} controls className="max-w-full max-h-[70vh] object-contain rounded-lg bg-black" />
                    )}
                </div>
                <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm p-4 rounded-lg text-white">
                    {isEditing ? (
                        <div className="space-y-2">
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded" placeholder="Judul"/>
                            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded" placeholder="Deskripsi"></textarea>
                            <div className="flex gap-2">
                                <button onClick={handleSave} className="bg-blue-600 px-3 py-1 rounded">Simpan</button>
                                <button onClick={() => setIsEditing(false)} className="bg-gray-500 px-3 py-1 rounded">Batal</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-xl">{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                            {isOwner && (
                                <div className="flex gap-3">
                                    <button onClick={() => setIsEditing(true)} className="p-2 bg-white/20 rounded-full hover:bg-white/40"><EditIcon /></button>
                                    <button onClick={() => onDelete(item.id)} className="p-2 bg-white/20 rounded-full hover:bg-white/40"><DeleteIcon /></button>
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
    const [customMenus, setCustomMenus] = useState([]);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setShowLogin(!currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const mediaCollectionRef = collection(db, 'media');
        const q = query(mediaCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const mediaList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMedia(mediaList);
            setLoadingMedia(false);
        }, (error) => {
            console.error("Error fetching media:", error);
            setNotification({ type: 'error', message: 'Gagal memuat data galeri.' });
            setLoadingMedia(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            setCustomMenus([]);
            return;
        };
        const menusCollectionRef = collection(db, 'menus');
        const q = query(menusCollectionRef, where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const menuList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCustomMenus(menuList);
        });
        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        setPage('home');
        setNotification({ type: 'info', message: 'Anda telah logout.' });
    };

    const handleLike = async (itemId, hasLiked) => {
        if (!user) {
            setNotification({ type: 'error', message: 'Silakan login untuk menyukai post.' });
            setShowLogin(true);
            return;
        }
        const itemRef = doc(db, 'media', itemId);
        try {
            await updateDoc(itemRef, {
                likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
        } catch (error) {
            console.error("Error updating like:", error);
            setNotification({ type: 'error', message: 'Gagal memperbarui suka.' });
        }
    };
    
    const handleShare = (itemId) => {
        const url = `${window.location.href}#item/${itemId}`;
        navigator.clipboard.writeText(url)
            .then(() => setNotification({ type: 'success', message: 'Link telah disalin!' }))
            .catch(() => setNotification({ type: 'error', message: 'Gagal menyalin link.' }));
    };

    const handleDeleteMedia = async (itemId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus media ini?")) {
            try {
                await deleteDoc(doc(db, 'media', itemId));
                setNotification({ type: 'info', message: 'Media berhasil dihapus.' });
                setSelectedItem(null);
            } catch (error) {
                console.error("Error deleting media:", error);
                setNotification({ type: 'error', message: `Gagal menghapus: ${error.message}` });
            }
        }
    };

    const handleUpdateMedia = async (itemId, data) => {
        try {
            const itemRef = doc(db, 'media', itemId);
            await updateDoc(itemRef, data);
            setNotification({ type: 'success', message: 'Media berhasil diperbarui.' });
            const updatedItem = { ...selectedItem, ...data };
            setSelectedItem(updatedItem);
        } catch (error) {
            console.error("Error updating media:", error);
            setNotification({ type: 'error', message: `Gagal memperbarui: ${error.message}` });
        }
    };

    const handleNavigation = (pageName) => {
        const protectedPages = ['gallery', 'videos', 'upload', 'settings', ...customMenus.map(m => m.pageName)];
        if (protectedPages.includes(pageName) && !user) {
            setNotification({type: 'info', message: 'Anda harus login untuk mengakses halaman ini.'});
            setShowLogin(true);
            return;
        }
        setPage(pageName);
        setIsSidebarOpen(false);
    }
    
    const renderPage = () => {
        if (loadingMedia) {
            return <div className="flex justify-center items-center h-full p-8"><p>Memuat data...</p></div>;
        }

        const customMenu = customMenus.find(m => m.pageName === page);
        if (customMenu) {
             const customMedia = media.filter(m => m.userId === user?.uid);
             return <HomePage media={customMedia} currentUser={user} onLike={handleLike} onShare={handleShare} onSelect={setSelectedItem} pageTitle={customMenu.label} />;
        }

        switch (page) {
            case 'home':
                return <HomePage media={media} currentUser={user} onLike={handleLike} onShare={handleShare} onSelect={setSelectedItem} pageTitle="Feed Terbaru" />;
            case 'gallery':
                const userMedia = media.filter(m => m.userId === user?.uid);
                return <GalleryPage media={user ? userMedia : []} onSelect={setSelectedItem} pageTitle="Galeri Saya" />;
            case 'videos':
                const userVideos = media.filter(m => m.userId === user?.uid && m.type === 'video');
                return <GalleryPage media={user ? userVideos : []} onSelect={setSelectedItem} pageTitle="Video Saya" />;
            case 'upload':
                return <UploadPage currentUser={user} setNotification={setNotification} onUploadComplete={() => setPage('gallery')} />;
            case 'settings':
                return <SettingsPage user={user} setNotification={setNotification} />;
            default:
                return <HomePage media={media} currentUser={user} onLike={handleLike} onShare={handleShare} onSelect={setSelectedItem} pageTitle="Feed Terbaru" />;
        }
    };

    const NavLink = ({ icon, label, pageName }) => (
        <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation(pageName); }}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors duration-200 ${page === pageName ? 'bg-blue-100 text-blue-600 font-semibold' : ''}`}
        >
            {icon}
            <span className="ml-4">{label}</span>
        </a>
    );

    if (loadingAuth) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Memuat aplikasi...</p></div>;
    }
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Notification notification={notification} setNotification={setNotification} />
            <LightboxModal item={selectedItem} user={user} onClose={() => setSelectedItem(null)} onUpdate={handleUpdateMedia} onDelete={handleDeleteMedia} />
            {showLogin && !user && <LoginPage setNotification={setNotification} onLoginSuccess={() => setShowLogin(false)} />}

            <div className="flex">
                <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-8 px-4">GaleriKu</div>
                    <nav className="flex-grow space-y-2">
                        <NavLink icon={<HomeIcon />} label="Home" pageName="home" />
                        {user && ( <>
                            <NavLink icon={<GalleryIcon />} label="Galeri Saya" pageName="gallery" />
                            <NavLink icon={<VideoIcon />} label="Video" pageName="videos" />
                            <NavLink icon={<UploadIcon />} label="Upload" pageName="upload" />
                            <hr className="my-4" />
                            {customMenus.map(menu => ( <NavLink key={menu.id} icon={<MenuIcon />} label={menu.label} pageName={menu.pageName} /> ))}
                            <hr className="my-4" />
                            <NavLink icon={<SettingsIcon />} label="Pengaturan" pageName="settings" />
                        </> )}
                    </nav>
                    {user && (
                        <div className="mt-auto">
                           <a href="#" onClick={handleLogout} className="flex items-center px-4 py-3 text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors duration-200">
                               <LogoutIcon />
                               <span className="ml-4">Logout</span>
                           </a>
                       </div>
                    )}
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
                            {customMenus.map(menu => ( <NavLink key={menu.id} icon={<MenuIcon />} label={menu.label} pageName={menu.pageName} /> ))}
                            <hr className="my-4" />
                            <NavLink icon={<SettingsIcon />} label="Pengaturan" pageName="settings" />
                        </> )}
                    </nav>
                    {user && (
                        <div className="mt-auto">
                           <a href="#" onClick={handleLogout} className="flex items-center px-4 py-3 text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors duration-200">
                               <LogoutIcon />
                               <span className="ml-4">Logout</span>
                           </a>
                       </div>
                    )}
                </aside>
                
                <main className="flex-1">
                    <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-10 flex items-center justify-between p-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 md:hidden">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="text-xl font-bold text-blue-600 md:hidden">GaleriKu</div>
                        <div className="flex-grow"></div>
                        <div className="flex items-center">
                           {user ? (
                                <>
                                    <span className="text-sm font-medium text-gray-700 mr-3 hidden sm:block">{user.email}</span>
                                    <img className="h-10 w-10 rounded-full object-cover" src={`https://i.pravatar.cc/40?u=${user.uid}`} alt="User avatar" />
                                </>
                           ) : (
                               <button onClick={() => setShowLogin(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm">
                                   Login / Daftar
                               </button>
                           )}
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
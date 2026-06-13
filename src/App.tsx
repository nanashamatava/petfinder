/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { PetListing, Language } from './types';
import { translations, geCities, geAnimalTypes } from './lib/translations';
import { motion, AnimatePresence } from 'motion/react';

// Components
import Header from './components/Header';
import MapGeorgia from './components/MapGeorgia';
import ListingCard from './components/ListingCard';
import AuthModal from './components/AuthModal';

// Icons
import { Search, PlusCircle, AlertTriangle, CheckCircle, Info, Heart, Share2, Mail, Phone, Calendar, MapPin, Sparkles, SlidersHorizontal, Image, X } from 'lucide-react';

const DEFAULT_COMMUNITY_LISTINGS: PetListing[] = [
  {
    id: 'demo_post_1',
    userId: 'user_tariel',
    userName: 'ტარიელი კ.',
    userEmail: 'tariel@example.com',
    type: 'lost',
    animalType: 'Dog',
    name: 'ბომბორა',
    description: 'საბურთალოზე, დელისის მეტროსთან დაიკარგა 2 წლის ოქროსფერი რეტრივერი. კეთილია, ეხმაურება სახელს. ყელზე უკეთია წითელი საყელური.',
    date: '2026-06-11',
    location: 'გაზაფხულის ქუჩა, დელისის მეტრო',
    city: 'tbilisi',
    contactPhone: '+995 599 123 456',
    reward: '500 ₾',
    photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    views: 142,
    createdAt: { seconds: 1781290400, nanoseconds: 0 },
    updatedAt: { seconds: 1781290400, nanoseconds: 0 }
  },
  {
    id: 'demo_post_2',
    userId: 'user_ana',
    userName: 'ანა მ.',
    userEmail: 'ana_m@example.com',
    type: 'lost',
    animalType: 'Cat',
    name: 'ჩიჩო',
    description: 'ვეძებთ ჭრელ კატას (ნაცრისფერი და თეთრი ზოლებით), რომელიც გავიდა აივნიდან ბათუმში, პორტის მიმდებარე ტერიტორიაზე. არის ძალიან მშიშარა.',
    date: '2026-06-10',
    location: 'მემედ აბაშიძის გამზირი, პორტთან',
    city: 'batumi',
    contactPhone: '+995 577 987 654',
    photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    views: 89,
    createdAt: { seconds: 1781204000, nanoseconds: 0 },
    updatedAt: { seconds: 1781204000, nanoseconds: 0 }
  },
  {
    id: 'demo_post_3',
    userId: 'user_vno',
    userName: 'ვანო ჩ.',
    userEmail: 'vano_ch@example.com',
    type: 'lost',
    animalType: 'Parrot',
    name: 'კოკი',
    description: 'დაიკარგა თეთრი თუთიყუში კოკატო ქუთაისში. მხარზე ჯდომა უყვარს და ლაპარაკობს სახელს "კოკი". გთხოვთ დაგვეხმაროთ პოვნაში!',
    date: '2026-06-12',
    location: 'წერეთლის ქუჩა, ცენტრალური პარკი',
    city: 'kutaisi',
    contactPhone: '+995 555 456 789',
    reward: '200 ₾',
    photo: 'https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    views: 54,
    createdAt: { seconds: 1781376800, nanoseconds: 0 },
    updatedAt: { seconds: 1781376800, nanoseconds: 0 }
  },
  {
    id: 'demo_post_4',
    userId: 'user_lizi',
    userName: 'ლიზი კ.',
    userEmail: 'lizi_k@example.com',
    type: 'lost',
    animalType: 'Rabbit',
    name: 'ცუცა',
    description: 'გლდანის მე-4 მიკრორაიონში ეზოდან გაიპარა თეთრი დეკორატიული ბოცვერი შავი ყურებით. ძალიან ვინერვიულებთ, ბავშვის საყვარელი მეგობარია.',
    date: '2026-06-09',
    location: 'გლდანის მე-4 მ/რ, კორპუსი 12',
    city: 'tbilisi',
    contactPhone: '+995 593 111 222',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    views: 110,
    createdAt: { seconds: 1781117600, nanoseconds: 0 },
    updatedAt: { seconds: 1781117600, nanoseconds: 0 }
  },
  {
    id: 'demo_post_5',
    userId: 'user_giorgi',
    userName: 'გიორგი ს.',
    userEmail: 'giorgi_s@example.com',
    type: 'lost',
    animalType: 'Dog',
    name: 'ბადი',
    description: 'რუსთავში, შარტავას მოედანთან დაიკარგა პატარა ზომის ჰასკი ცისფერი თვალებით. კეთილია, აცრილია, აქვს მიკროჩიპიც.',
    date: '2026-06-08',
    location: 'შარტავას გამზირი, მაკდონალდსის უკან',
    city: 'rustavi',
    contactPhone: '+995 599 876 543',
    reward: '350 ₾',
    photo: 'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    views: 95,
    createdAt: { seconds: 1781031200, nanoseconds: 0 },
    updatedAt: { seconds: 1781031200, nanoseconds: 0 }
  },
  {
    id: 'demo_post_6',
    userId: 'user_tekla',
    userName: 'თეკლა გ.',
    userEmail: 'tekla@example.com',
    type: 'lost',
    animalType: 'Cat',
    name: 'ნაჭყვიტა',
    description: 'ქობულეთში, სანაპიროსთან დაიკარგა თეთრი სიამის კატა ცისფერი თვალებით. ძალიან გთხოვთ თუ ვინმეს გყავთ შეფარებული ან გინახავთ შეგვეხმიანეთ.',
    date: '2026-06-07',
    location: 'აღმაშენებლის ქუჩა, პარკთან ახლოს',
    city: 'batumi',
    contactPhone: '+995 591 223 344',
    photo: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    views: 73,
    createdAt: { seconds: 1780944800, nanoseconds: 0 },
    updatedAt: { seconds: 1780944800, nanoseconds: 0 }
  },
  {
    id: 'demo_post_7',
    userId: 'user_neli',
    userName: 'ნელი დ.',
    userEmail: 'neli_d@example.com',
    type: 'lost',
    animalType: 'Dog',
    name: 'ჯეკი',
    description: 'ვაკეში, მრგვალ ბაღთან გაგვექცა პატარა ჯეკ რასელ ტერიერი. არის ძალიან მოძრავი, უყვარს ბურთებით თამაში. გთხოვთ დაგვეხმაროთ.',
    date: '2026-06-12',
    location: 'მრგვალი ბაღი, ბარნოვის ქუჩა',
    city: 'tbilisi',
    contactPhone: '+995 551 778 899',
    reward: '400 ₾',
    photo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    views: 205,
    createdAt: { seconds: 1781376800, nanoseconds: 0 },
    updatedAt: { seconds: 1781376800, nanoseconds: 0 }
  },
  {
    id: 'demo_post_8',
    userId: 'user_sandro',
    userName: 'სანდრო ხ.',
    userEmail: 'sandro@example.com',
    type: 'lost',
    animalType: 'Cat',
    name: 'ბასტრა',
    description: 'შავი სქელი შოტლანდიური კატა სტაფილოსფერი თვალებით. დაიკარგა გორის ცენტრში. საყელური არ უკეთია.',
    date: '2026-06-05',
    location: 'სტალინის გამზირი, თეატრთან',
    city: 'gori',
    contactPhone: '+995 598 445 566',
    photo: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    views: 42,
    createdAt: { seconds: 1780772000, nanoseconds: 0 },
    updatedAt: { seconds: 1780772000, nanoseconds: 0 }
  },
  {
    id: 'demo_post_9',
    userId: 'user_eka',
    userName: 'ეკა ტ.',
    userEmail: 'eka_t@example.com',
    type: 'lost',
    animalType: 'Dog',
    name: 'ლუი',
    description: 'ვეძებთ ფრანგულ ბულდოგს, დაიკარგა ზუგდიდში პარკის მიმდებარედ. შავ-თეთრი შეფერილობისაა, აქვს ნაიარევი მარჯვენა ყურზე.',
    date: '2026-06-04',
    location: 'დადიანების სასახლის ეზო',
    city: 'zugdidi',
    contactPhone: '+995 595 607 080',
    reward: '600 ₾',
    photo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    views: 115,
    createdAt: { seconds: 1780685600, nanoseconds: 0 },
    updatedAt: { seconds: 1780685600, nanoseconds: 0 }
  },
  {
    id: 'demo_post_10',
    userId: 'user_luka',
    userName: 'ლუკა ვ.',
    userEmail: 'luka_v@example.com',
    type: 'lost',
    animalType: 'Dog',
    name: 'მაქსი',
    description: 'ოქროსფერი კოკერ სპანიელი დაიკარგა ფოთში, მალთაყვის რაიონში. არის ძალიან მშიშარა, მაგრამ კეთილი.',
    date: '2026-06-02',
    location: 'მალთაყვის სანაპირო ზოლი',
    city: 'poti',
    contactPhone: '+995 579 554 433',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    views: 61,
    createdAt: { seconds: 1780512800, nanoseconds: 0 },
    updatedAt: { seconds: 1780512800, nanoseconds: 0 }
  }
];

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Core Listings & Selections State
  const [listings, setListings] = useState<PetListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<PetListing | null>(null);
  const [selectedMapCity, setSelectedMapCity] = useState<string>('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all'); // 'all', 'lost', 'found'
  const [filterAnimal, setFilterAnimal] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all', 'active', 'reunited'
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // User Action Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'lost' | 'found'>('lost');
  
  // Edit State
  const [editingListing, setEditingListing] = useState<PetListing | null>(null);

  // Client-side local favorites array list
  const [favorites, setFavorites] = useState<string[]>([]);

  // Platform alerts feed
  const [alerts, setAlerts] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Field States
  const [formAnimalType, setFormAnimalType] = useState<'Dog' | 'Cat' | 'Bird' | 'Parrot' | 'Rabbit' | 'Other'>('Dog');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCity, setFormCity] = useState('tbilisi');
  const [formPhone, setFormPhone] = useState('');
  const [formContactInfo, setFormContactInfo] = useState('');
  const [formReward, setFormReward] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);

  // View States
  const [currentView, setCurrentView] = useState<'home' | 'favorites' | 'admin' | 'others_posts'>('home');

  const t = translations[lang];

  // 1. Listen for Authentication Changes (including Local Bypass Mode support)
  useEffect(() => {
    // Check if bypass user exists locally
    const bypassedRaw = localStorage.getItem('petfinder_georgia_bypass_user');
    if (bypassedRaw) {
      try {
        const bypassedUser = JSON.parse(bypassedRaw);
        setUser(bypassedUser);
        const adminEmail = 'nanashamatava51@gmail.com';
        setIsAdmin(bypassedUser.email?.toLowerCase() === adminEmail.toLowerCase() || bypassedUser.email === 'tester@petfinder.ge');
        return;
      } catch (e) {
        console.error("Failed to restore bypass user:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Clean fallback if no bypass user exists
      if (!localStorage.getItem('petfinder_georgia_bypass_user')) {
        setUser(currentUser);
        if (currentUser) {
          const adminEmail = 'nanashamatava51@gmail.com';
          const isUserAdmin = currentUser.email?.toLowerCase() === adminEmail.toLowerCase() || currentUser.email === 'tester@petfinder.ge';
          setIsAdmin(isUserAdmin);
        } else {
          setIsAdmin(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Load Local Favorites list
  useEffect(() => {
    const saved = localStorage.getItem('petfinder_georgia_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 3. Realtime Firestore Synchronization of Listings with Seamless Local Fallback
  useEffect(() => {
    const path = 'listings';
    setLoading(true);
    let unsub = () => {};

    // Load any offline listings saved locally in background
    const localListingsRaw = localStorage.getItem('petfinder_georgia_local_listings');
    let initialLocal: PetListing[] = [];
    if (localListingsRaw) {
      try {
        initialLocal = JSON.parse(localListingsRaw);
      } catch (e) {
        console.error("Local listings parse error:", e);
      }
    }

    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      unsub = onSnapshot(q, (snapshot) => {
        const items: PetListing[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            ...data,
          } as PetListing);
        });

        // Trigger a localized system alert update on new list items
        if (listings.length > 0 && items.length > listings.length) {
          const differenceCount = items.length - listings.length;
          const msg = lang === 'en' 
            ? `🔔 ${differenceCount} new animal report published recently.` 
            : `🔔 ${differenceCount} ახალი განცხადება დაემატა რუკაზე.`;
          setAlerts(prev => [msg, ...prev]);
        }

        // Merge, prioritizing remote Firestore posts and adding any unique local mock entries
        const remoteIds = new Set(items.map(i => i.id));
        const filteredLocal = initialLocal.filter(l => !remoteIds.has(l.id));
        const combined = [...items, ...filteredLocal, ...DEFAULT_COMMUNITY_LISTINGS];
        setListings(combined);
        setLoading(false);
      }, (error) => {
        console.warn("Firestore collection load blocked or failed. Running in Local Sandbox state.", error);
        setListings([...initialLocal, ...DEFAULT_COMMUNITY_LISTINGS]);
        setLoading(false);
      });
    } catch (err) {
      console.error("Firestore onSnapshot setup failed:", err);
      setListings([...initialLocal, ...DEFAULT_COMMUNITY_LISTINGS]);
      setLoading(false);
    }

    return () => unsub();
  }, [lang]);

  // Save changes to local favorites array lists
  function toggleFavorite(listingId: string) {
    let updated: string[] = [];
    if (favorites.includes(listingId)) {
      updated = favorites.filter(id => id !== listingId);
      triggerToast(lang === 'en' ? 'Removed from saved favorites' : 'წაიშალა ფავორიტებიდან');
    } else {
      updated = [...favorites, listingId];
      triggerToast(lang === 'en' ? 'Saved to my favorite pets collection!' : 'შენახულია ფავორიტებში!');
    }
    setFavorites(updated);
    localStorage.setItem('petfinder_georgia_favorites', JSON.stringify(updated));
  }

  // Toast notifier helper
  function triggerToast(message: string) {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 3500);
  }

  // Prepares the submission form either for creation or editing
  function handleOpenForm(type: 'lost' | 'found', editItem: PetListing | null = null) {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setFormType(type);
    setEditingListing(editItem);

    if (editItem) {
      setFormAnimalType(editItem.animalType);
      setFormName(editItem.name || '');
      setFormDescription(editItem.description);
      setFormDate(editItem.date);
      setFormLocation(editItem.location);
      setFormCity(editItem.city);
      setFormPhone(editItem.contactPhone);
      setFormContactInfo(editItem.contactInfo || '');
      setFormReward(editItem.reward || '');
      setFormPhoto(editItem.photo || '');
    } else {
      // Clear values for fresh creation
      setFormAnimalType('Dog');
      setFormName('');
      setFormDescription('');
      // Set to today's date
      const today = new Date().toISOString().split('T')[0];
      setFormDate(today);
      setFormLocation('');
      setFormCity('tbilisi');
      setFormPhone('');
      setFormContactInfo('');
      setFormReward('');
      setFormPhoto('');
    }

    setIsFormOpen(true);
  }

  // Read images and convert to structured Base64 format securely
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert(lang === 'en' 
        ? "Photo file size is too large. Please select an image under 1.5MB" 
        : "ფოტო ფაილი ძალიან დიდია. გთხოვთ აირჩიოთ 1.5MB-მდე ზომის სურათი"
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Submit Listing Form (Creates new Firestore entry or updates existing one)
  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!formDescription.trim() || !formLocation.trim() || !formPhone.trim()) {
      alert(lang === 'en' ? "Please fulfill all required fields" : "გთხოვთ შეავსოთ ყველა აუცილებელი ველი");
      return;
    }

    setSubmittingForm(true);
    const path = 'listings';

    const payload: Partial<PetListing> = {
      userId: user.uid,
      userEmail: user.email || 'guest@petfinder.ge',
      userName: user.displayName || 'Anonymous User',
      type: formType,
      animalType: formAnimalType,
      name: formName.trim() || undefined,
      description: formDescription.trim(),
      date: formDate,
      location: formLocation.trim(),
      city: formCity,
      contactPhone: formPhone.trim(),
      contactInfo: formContactInfo.trim() || undefined,
      reward: formType === 'lost' && formReward.trim() ? formReward.trim() : undefined,
      photo: formPhoto,
      status: editingListing ? editingListing.status : 'active',
      views: editingListing ? editingListing.views : 0,
      updatedAt: Timestamp.now(),
    };

    try {
      if (editingListing) {
        // Securely update the firestore document, fallback to local storage on blockage
        try {
          const reportDoc = doc(db, path, editingListing.id);
          await updateDoc(reportDoc, payload);
        } catch (dbErr) {
          console.warn("Firestore update failed, updating locally only.", dbErr);
          // Update in localStorage
          const localListingsRaw = localStorage.getItem('petfinder_georgia_local_listings') || '[]';
          let localListings: PetListing[] = JSON.parse(localListingsRaw);
          localListings = localListings.map(item => item.id === editingListing.id ? { ...item, ...payload } as PetListing : item);
          localStorage.setItem('petfinder_georgia_local_listings', JSON.stringify(localListings));

          // Update state directly
          setListings(prev => prev.map(item => item.id === editingListing.id ? { ...item, ...payload } as PetListing : item));
        }
        triggerToast(lang === 'en' ? "Your report was updated successfully!" : "განცხადება წარმატებით დარედაქტირდა!");
      } else {
        // Securely publish a new report item
        const finalPayload = {
          ...payload,
          createdAt: Timestamp.now(),
        };
        try {
          await addDoc(collection(db, path), finalPayload);
        } catch (dbErr) {
          console.warn("Firestore insert failed, saving locally only.", dbErr);
          const tempId = 'local_' + Date.now();
          const localPayload = {
            id: tempId,
            ...payload,
            createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
          };
          const localListingsRaw = localStorage.getItem('petfinder_georgia_local_listings') || '[]';
          const localListings: PetListing[] = JSON.parse(localListingsRaw);
          localListings.unshift(localPayload as PetListing);
          localStorage.setItem('petfinder_georgia_local_listings', JSON.stringify(localListings));

          // Update state directly
          setListings(prev => [localPayload as PetListing, ...prev]);
        }
        triggerToast(lang === 'en' ? "Your report was published successfully!" : "განცხადება წარმატებით გამოქვეყნდა!");
      }

      setIsFormOpen(false);
      setEditingListing(null);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, editingListing ? OperationType.UPDATE : OperationType.CREATE, `${path}/${editingListing?.id || 'new'}`);
    } finally {
      setSubmittingForm(false);
    }
  }

  // Remove report item securely
  async function handleDeleteListing(listingId: string) {
    const confirmMessage = lang === 'en' 
      ? "Are you sure you want to delete this listing permanently from PetFinder Georgia?" 
      : "ნამდვილად გსურთ ამ განცხადების სამუდამოდ წაშლა?";
    
    if (!window.confirm(confirmMessage)) return;

    const path = 'listings';
    try {
      try {
        await deleteDoc(doc(db, path, listingId));
      } catch (dbErr) {
        console.warn("Firestore delete failed, deleting locally only.", dbErr);
        // Delete from local storage
        const localListingsRaw = localStorage.getItem('petfinder_georgia_local_listings') || '[]';
        let localListings: PetListing[] = JSON.parse(localListingsRaw);
        localListings = localListings.filter(item => item.id !== listingId);
        localStorage.setItem('petfinder_georgia_local_listings', JSON.stringify(localListings));

        // Update state directly
        setListings(prev => prev.filter(item => item.id !== listingId));
      }
      triggerToast(lang === 'en' ? "Listing deleted successfully" : "განცხადება წაიშალა წარმატებით");
      if (selectedListing?.id === listingId) {
        setSelectedListing(null);
      }
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, `${path}/${listingId}`);
    }
  }

  // Mark pet as reunited
  async function handleMarkReunited(listingId: string) {
    const path = 'listings';
    try {
      try {
        const reportDoc = doc(db, path, listingId);
        await updateDoc(reportDoc, {
          status: 'reunited',
          updatedAt: Timestamp.now()
        });
      } catch (dbErr) {
        console.warn("Firestore update reunited failed, updating locally only.", dbErr);
        // Update in localStorage
        const localListingsRaw = localStorage.getItem('petfinder_georgia_local_listings') || '[]';
        let localListings: PetListing[] = JSON.parse(localListingsRaw);
        localListings = localListings.map(item => item.id === listingId ? { ...item, status: 'reunited' } as PetListing : item);
        localStorage.setItem('petfinder_georgia_local_listings', JSON.stringify(localListings));

        // Update state directly
        setListings(prev => prev.map(item => item.id === listingId ? { ...item, status: 'reunited' } as PetListing : item));
      }
      triggerToast(lang === 'en' ? "🎉 Wonderful news! Reunited status saved!" : "🎉 შესანიშნავი ამბავია! პატრონი დაუბრუნდა!");
      
      // Update the active popup view if open
      if (selectedListing?.id === listingId) {
        setSelectedListing(prev => prev ? { ...prev, status: 'reunited' } : null);
      }
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `${path}/${listingId}`);
    }
  }

  // Filters listings on parameters
  const filteredListings = listings.filter(item => {
    // 1. Text Query Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = item.name?.toLowerCase().includes(q) || false;
      const descMatch = item.description.toLowerCase().includes(q);
      const locMatch = item.location.toLowerCase().includes(q);
      const animalMatch = item.animalType.toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !locMatch && !animalMatch) return false;
    }

    // 2. Type Filter (Lost, Found)
    if (filterType !== 'all' && item.type !== filterType) return false;

    // 3. Animal Category Filter
    if (filterAnimal !== 'all' && item.animalType !== filterAnimal) return false;

    // 4. Region City Filter
    if (filterCity !== 'all' && item.city !== filterCity) return false;

    // 5. Status Filter (Active vs Reunited)
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;

    // 6. Favorites Filter list
    if (showFavoritesOnly && !favorites.includes(item.id)) return false;

    return true;
  });

  // Filters lost listings posted by fellow other citizens
  const othersLostListings = listings.filter(item => {
    // Show strictly "lost" pets
    if (item.type !== 'lost') return false;

    // Show other people's posts (exclude own postings if registered)
    if (user && item.userId === user.uid) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = item.name?.toLowerCase().includes(q) || false;
      const descMatch = item.description.toLowerCase().includes(q);
      const locMatch = item.location.toLowerCase().includes(q);
      const animalMatch = item.animalType.toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !locMatch && !animalMatch) return false;
    }

    if (filterAnimal !== 'all' && item.animalType !== filterAnimal) return false;
    if (filterCity !== 'all' && item.city !== filterCity) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;

    return true;
  });

  // Filter active lost pets in the selected map city
  const lostPetsInSelectedCity = listings.filter(item => 
    item.city === selectedMapCity && 
    item.type === 'lost' && 
    item.status === 'active'
  );

  // Calculate platform counters
  const totalCount = listings.length;
  const lostCount = listings.filter(i => i.type === 'lost').length;
  const foundCount = listings.filter(i => i.type === 'found').length;
  const reunitedCount = listings.filter(i => i.status === 'reunited').length;

  // Calculate specific city statistics counts for the interactive map
  const cityCounts = listings.reduce((acc, item) => {
    if (item.status === 'active') {
      acc[item.city] = (acc[item.city] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div id="petfinder-georgia-root" className="min-h-screen flex flex-col justify-between bg-[#FFFBF7] text-[#2D3436] font-sans">
      
      {/* Toast Notifier */}
      {successToast && (
        <div 
          id="success-toast-alert" 
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-3xl bg-[#2CB67D] border-4 border-black text-white px-5 py-3.5 shadow-[0_6px_0_rgba(0,0,0,0.15)] font-black text-xs uppercase tracking-widest"
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Navigation bar */}
      <Header
        currentLang={lang}
        onLanguageChange={setLang}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        isAdmin={isAdmin}
        favoritesCount={favorites.length}
        unresolvedAlerts={alerts}
        onClearAlerts={() => setAlerts([])}
        onShowFavorites={() => { setShowFavoritesOnly(p => !p); setCurrentView('home'); }}
        onShowAdminDashboard={() => setCurrentView('admin')}
        onGoHome={() => { setCurrentView('home'); setShowFavoritesOnly(false); }}
        onShowOthersPosts={() => { setCurrentView('others_posts'); setShowFavoritesOnly(false); }}
        currentView={currentView}
      />

      {/* Content wrapper */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 mb-12">
        
        {currentView === 'home' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* 1. Hero Workspace Banner Section */}
            <section 
              id="hero-banner-section" 
              className="relative rounded-3xl overflow-hidden border-4 border-[#F0E6D2] bg-[#FFE8D6] p-6 sm:p-10 text-center flex flex-col items-center justify-center shadow-[0_12px_0_#F0E6D2]"
            >
              <div className="absolute top-4 right-4 text-xs font-black bg-white/70 px-3 py-1 rounded-full border border-[#FFF9F2] text-[#FF8E3C] tracking-wide">
                🎨 {lang === 'en' ? "Vibrant Palette Theme" : "ცოცხალი ფალიტრა"}
              </div>

              <div className="max-w-xl space-y-4">
                <span className="text-4xl sm:text-5xl inline-block animate-pulse">🇬🇪</span>
                <h2 className="text-3xl sm:text-5xl font-sans font-black leading-none text-[#2D3436] tracking-tight">
                  {lang === 'en' ? "United for Georgia's Pets" : "ვიზრუნოთ ერთად ცხოველებზე"}
                </h2>
                <p className="text-sm sm:text-base font-bold text-zinc-650 leading-relaxed">
                  {t.tagline}
                </p>

                {/* Main Unified Call to Actions */}
                <div className="flex flex-wrap items-center justify-center gap-4.5 pt-3">
                  <button
                    id="btn-report-lost-hero"
                    onClick={() => handleOpenForm('lost')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FF6B6B] hover:opacity-95 text-white font-black text-xs uppercase tracking-widest shadow-[0_5px_0_rgba(255,107,107,0.25)] active:translate-y-[2px] transition-all"
                  >
                    <AlertTriangle className="w-4 h-4 text-white" />
                    <span>{t.heroButtonLost}</span>
                  </button>
                  <button
                    id="btn-report-found-hero"
                    onClick={() => handleOpenForm('found')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2CB67D] hover:opacity-95 text-white font-black text-xs uppercase tracking-widest shadow-[0_5px_0_rgba(44,182,125,0.25)] active:translate-y-[2px] transition-all"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>{t.heroButtonFound}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 2. Interactive Georgia Map and Core Statistics Layout */}
            <section id="map-and-statistics-split" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Map block */}
              <div className="lg:col-span-2">
                <MapGeorgia 
                  selectedCity={filterCity === 'all' ? '' : filterCity} 
                  onSelectCity={(cityId) => {
                    setFilterCity(cityId || 'all');
                    if (cityId) {
                      setSelectedMapCity(cityId);
                    }
                  }} 
                  lang={lang} 
                  cityCounts={cityCounts} 
                />
              </div>

              {/* Statistics Panel card */}
              <div className="flex flex-col justify-between p-6 bg-white border-2 border-[#F0E6D2] rounded-3xl shadow-[0_8px_0_#F0E6D2] text-left">
                <div>
                  <h3 className="text-lg font-black text-[#2D3436] tracking-tight mb-1 flex items-center gap-1.5">
                    📈 {t.statsTitle}
                  </h3>
                  <p className="text-xs text-zinc-500 font-bold mb-4 leading-relaxed">
                    {t.statsSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-2">
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{t.statsTotal}</span>
                    <span className="text-2xl font-black text-[#2D3436]">{totalCount}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-[#FF6B6B] uppercase">{t.statsLostCount}</span>
                    <span className="text-2xl font-black text-[#FF6B6B]">{lostCount}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-[#2CB67D] uppercase">{t.statsFoundCount}</span>
                    <span className="text-2xl font-black text-[#2CB67D]">{foundCount}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-amber-700 uppercase">{t.statsReunitedCount}</span>
                    <span className="text-2xl font-black text-amber-700">🎉 {reunitedCount}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                  <Info className="w-4 h-4 text-[#FF8E3C] shrink-0" />
                  <span>
                    {lang === 'en' 
                      ? "Keep records active to help neighborhood patrollers stay informed!" 
                      : "დაგვეხმარეთ ინფორმაციის განახლებაში ცხოველების გადასარჩენად!"}
                  </span>
                </div>
              </div>

            </section>



          </div>
        )}

        {/* Others' Lost Animal Posts View */}
        {currentView === 'others_posts' && (
          <div id="others-posts-page" className="space-y-8 text-left animate-fade-in">
            
            {/* Header / Intro banner */}
            <div className="rounded-3xl border-4 border-[#F0E6D2] bg-[#FFFBF7] p-6 sm:p-8 shadow-[0_8px_0_#F0E6D2] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-sm font-black text-[#FF8E3C] uppercase tracking-wider bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                  🐾 {lang === 'en' ? "Community Patrol" : "საზოგადოებრივი პატრული"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-sans font-black leading-none text-[#2D3436] tracking-tight">
                  {lang === 'en' ? "Other Users' Lost Pet Reports" : "სხვა ადამიანების დაკარგული ცხოველები"}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-zinc-650 leading-relaxed">
                  {lang === 'en' 
                    ? "Carefully inspect reports made by other caretakers. Contact the owners directly if you have seen or saved any of these animals." 
                    : "გაეცანით სხვა ადამიანების მიერ გამოქვეყნებულ განცხადებებს. დაუკავშირდით მფლობელებს თუ შენიშნეთ რომელიმე მათგანი."}
                </p>
              </div>
              <button
                id="back-home-from-others"
                onClick={() => { setCurrentView('home'); }}
                className="px-5 py-3 rounded-2xl bg-[#FF8E3C] hover:opacity-95 text-white text-xs font-black uppercase tracking-widest leading-none shadow-[0_4px_0_rgba(255,142,60,0.25)] active:translate-y-[2px] transition-all whitespace-nowrap cursor-pointer"
              >
                ◀ {lang === 'en' ? "Back to Dashboard" : "მთავარ გვერდზე"}
              </button>
            </div>

            {/* Filter controls specifically for others' posts query */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-[#F0E6D2] shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                {/* Search bar */}
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                    <Search className="w-5 h-5 text-[#FF8E3C] stroke-[2.5]" />
                  </span>
                  <input
                    id="others-posts-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'en' ? "Search by breed, features, color, locations..." : "მოძებნეთ სხვების პოსტებში სახელით, უბნით, განსაკუთრებული ნიშნით..."}
                    className="w-full rounded-2xl border-2 border-[#FFE8D6] bg-white py-3 pl-11 pr-4 text-sm font-bold text-zinc-800 outline-none focus:border-[#FF8E3C] transition-all"
                  />
                </div>

                {/* Filter dropdowns select list */}
                <div className="flex flex-wrap items-center gap-3 font-bold text-xs">
                  {/* Category Dropdown */}
                  <div className="flex flex-col">
                    <select
                      id="others-filter-animal"
                      value={filterAnimal}
                      onChange={(e) => setFilterAnimal(e.target.value)}
                      className="px-3.5 py-3 rounded-xl border border-[#FFE8D6] bg-white font-bold text-zinc-700 outline-none cursor-pointer hover:border-[#FF8E3C]"
                    >
                      <option value="all">🐱 {t.filterAnimalType} (All)</option>
                      {geAnimalTypes.map(c => (
                        <option key={c.id} value={c.id}>
                          {lang === 'en' ? c.nameEn : c.nameKa}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Region City Dropdown */}
                  <div className="flex flex-col">
                    <select
                      id="others-filter-city"
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="px-3.5 py-3 rounded-xl border border-[#FFE8D6] bg-white font-bold text-zinc-700 outline-none cursor-pointer hover:border-[#FF8E3C]"
                    >
                      <option value="all">📍 {t.filterCity} (All)</option>
                      {geCities.map(c => (
                        <option key={c.id} value={c.id}>
                          {lang === 'en' ? c.nameEn : c.nameKa}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex flex-col">
                    <select
                      id="others-filter-status"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3.5 py-3 rounded-xl border border-[#FFE8D6] bg-white font-bold text-zinc-700 outline-none cursor-pointer hover:border-[#FF8E3C]"
                    >
                      <option value="all">✅ {t.filterStatusAll}</option>
                      <option value="active">{t.filterStatusActive}</option>
                      <option value="reunited">{t.filterStatusReunited}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Cards Grid */}
            {othersLostListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border-2 border-dashed border-[#FFE8D6] rounded-3xl text-zinc-400 max-w-xl mx-auto text-center">
                <span className="text-5xl mb-4">🐾</span>
                <h4 className="text-lg font-black text-zinc-700">
                  {lang === 'en' ? "No Lost Reports Found" : "დაკარგული ცხოველები ვერ მოიძებნა"}
                </h4>
                <p className="text-xs font-medium text-zinc-500 mt-1 max-w-xs text-center leading-relaxed">
                  {lang === 'en' 
                    ? "There are no reports by other users matches the current filters." 
                    : "მითითებული ფილტრებით სხვა მომხმარებლების პოსტები ვერ მოიძებნა."}
                </p>
                <button
                  id="reset-others-filters"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterAnimal('all');
                    setFilterCity('all');
                    setFilterStatus('all');
                  }}
                  className="mt-5 text-xs font-black px-4 py-2 rounded-xl bg-[#FF8E3C] text-white vibrant-btn cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {othersLostListings.map(item => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    lang={lang}
                    onViewDetails={setSelectedListing}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.includes(item.id)}
                    currentUser={user}
                    isAdmin={isAdmin}
                    onEdit={(listing) => handleOpenForm(listing.type, listing)}
                    onDelete={handleDeleteListing}
                    onMarkReunited={handleMarkReunited}
                    isShareSupported={!!navigator.share}
                    onCopySuccess={() => triggerToast(t.shareSuccess)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* Admin Dashboard Page View */}
        {currentView === 'admin' && (
          <div id="admin-analytics-view" className="space-y-6 text-left animate-fade-in">
            <div className="flex items-center justify-between border-b-4 border-zinc-200 pb-4">
              <div>
                <h3 className="text-2xl font-black text-zinc-900 font-sans tracking-tight">⚙️ {t.adminDashboard}</h3>
                <p className="text-xs text-zinc-500 font-bold">Platform governance dashboard • Hello, Administrator!</p>
              </div>
              <button
                id="back-home-from-admin"
                onClick={() => setCurrentView('home')}
                className="text-xs font-black bg-zinc-105 border-2 border-zinc-300 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-xl"
              >
                Back To Main
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-white border-2 border-[#F0E6D2] rounded-3xl shadow-sm">
                <span className="text-[10px] font-black text-zinc-400 uppercase">Active Reports List</span>
                <span className="block text-3xl font-black text-zinc-900 mt-2">{listings.length} posts</span>
              </div>
              <div className="p-5 bg-white border-2 border-[#F0E6D2] rounded-3xl shadow-sm">
                <span className="text-[10px] font-black text-zinc-400 uppercase">Total Reunited</span>
                <span className="block text-3xl font-black text-amber-500 mt-2">🎉 {reunitedCount} pets</span>
              </div>
              <div className="p-5 bg-white border-2 border-[#F0E6D2] rounded-3xl shadow-sm">
                <span className="text-[10px] font-black text-zinc-400 uppercase">Lost Alert Percentage</span>
                <span className="block text-3xl font-black text-rose-500 mt-2">
                  {listings.length > 0 ? Math.round((lostCount / listings.length) * 100) : 0}% lost
                </span>
              </div>
            </div>

            <div id="admin-listings-table" className="bg-white border-2 border-[#F0E6D2] rounded-3xl overflow-hidden p-6 shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-wider text-[#FF8E3C] mb-4">
                {t.adminManageListings}
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-800">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 font-black uppercase tracking-wider">
                      <th className="pb-3 pr-4">Animal Type</th>
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Location</th>
                      <th className="pb-3 pr-4">Contact Phone</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Action Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-bold">
                    {listings.map(item => (
                      <tr key={item.id} className="hover:bg-zinc-50">
                        <td className="py-3.5 pr-4 flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.type === 'lost' ? 'bg-[#FF6B6B]' : 'bg-[#2CB67D]'}`} />
                          <span className="capitalize">{item.animalType}</span>
                        </td>
                        <td className="py-3.5 pr-4">{item.name || "Unnamed"}</td>
                        <td className="py-3.5 pr-4">{item.location} ({item.city})</td>
                        <td className="py-3.5 pr-4">{item.contactPhone}</td>
                        <td className="py-3.5 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${item.status === 'reunited' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-700'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-admin-view-${item.id}`}
                            onClick={() => setSelectedListing(item)}
                            className="text-[10px] font-black bg-[#FFF9F2] text-[#FF8E3C] px-3 py-1 rounded-lg border border-[#FFE8D6]"
                          >
                            View
                          </button>
                          <button
                            id={`btn-admin-remove-${item.id}`}
                            onClick={() => handleDeleteListing(item.id)}
                            className="text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1 rounded-lg border border-rose-200 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer id="app-footer-bar" className="border-t-4 border-[#F0E6D2] bg-white py-8 px-4 text-center text-xs text-zinc-400 font-black tracking-wider uppercase">
        <div>🐾 {t.brandName} • {lang === 'en' ? "Empowered by the Georgia Pet Care Coalition" : "საქართველოს ცხოველთა გადარჩენის საზოგადოება"}</div>
        <div className="mt-2 text-[10px] font-bold text-zinc-400 capitalize">Designed with precision under the 'Vibrant Palette' visual design specifications.</div>
      </footer>

      {/* Form Submission Modal Sheet */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              id="form-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />

            <motion.div
              id="multipage-report-wizard"
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFFBF7] p-6 border-4 border-[#F0E6D2] shadow-[0_12px_0_#F0E6D2] text-left"
            >
              <div className="flex items-center justify-between border-b-2 border-[#FFE8D6] pb-3 mb-4">
                <h3 className="text-xl font-black text-[#2D3436] font-sans tracking-tight">
                  {editingListing 
                    ? t.editListingTitle 
                    : formType === 'lost' 
                      ? t.reportLostTitle 
                      : t.reportFoundTitle}
                </h3>
                <button
                  id="cancel-submission-wizard"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Form Input Container */}
              <form id="listing-form" onSubmit={handleSubmitForm} className="space-y-4">
                
                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1">
                    {t.formPhoto}
                  </label>
                  <div className="relative border-4 border-dashed border-[#FFE8D6] rounded-2xl p-4 text-center bg-white hover:border-[#FF8E3C] transition-all">
                    {formPhoto ? (
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden max-h-48">
                        <img 
                          id="form-preview-photo-preview" 
                          src={formPhoto} 
                          alt="upload preview" 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          id="clear-form-photo"
                          type="button"
                          onClick={() => setFormPhoto('')}
                          className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                        <Image className="w-10 h-10 text-[#FF8E3C] mb-2" />
                        <span className="text-xs font-black text-zinc-800">{lang === 'en' ? "Choose Pet Image" : "აირჩიეთ ფოტო"}</span>
                        <span className="text-[10px] text-zinc-400 font-medium mt-1">{t.formPhotoHelper}</span>
                        <input
                          id="form-photo-upload-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Primary split layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Animal Type Selector */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1" htmlFor="animal-type-select">
                      {t.formAnimalType}
                    </label>
                    <select
                      id="animal-type-select"
                      value={formAnimalType}
                      onChange={(e) => setFormAnimalType(e.target.value as any)}
                      className="w-full rounded-2xl border-2 border-[#FFE8D6] bg-white p-3 text-sm font-bold text-zinc-800 outline-none focus:border-[#FF8E3C]"
                    >
                      {geAnimalTypes.map(c => (
                        <option key={c.id} value={c.id}>
                          {lang === 'en' ? c.nameEn : c.nameKa}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pet Name input field */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1" htmlFor="pet-name-input">
                      {t.formName}
                    </label>
                    <input
                      id="pet-name-input"
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={t.formNamePlaceholder}
                      className="w-full rounded-2xl border-2 border-[#FFE8D6] bg-white p-3 text-sm font-bold text-zinc-800 outline-none focus:border-[#FF8E3C]"
                    />
                  </div>

                  {/* Event date input */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1" htmlFor="event-date-input">
                      {formType === 'lost' ? t.formDateLost : t.formDateFound}
                    </label>
                    <input
                      id="event-date-input"
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full rounded-2xl border-2 border-[#FFE8D6] bg-white p-3 text-sm font-bold text-zinc-805 outline-none focus:border-[#FF8E3C]"
                    />
                  </div>

                  {/* Geolocation city select */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1" htmlFor="form-city-select">
                      {t.formCity}
                    </label>
                    <select
                      id="form-city-select"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full rounded-2xl border-2 border-[#FFE8D6] bg-white p-3 text-sm font-bold text-zinc-800 outline-none focus:border-[#FF8E3C]"
                    >
                      {geCities.map(c => (
                        <option key={c.id} value={c.id}>
                          {lang === 'en' ? c.nameEn : c.nameKa}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Specific Location String Field */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1" htmlFor="specific-location-input">
                    {t.formLocation}
                  </label>
                  <input
                    id="specific-location-input"
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder={t.formLocationPlaceholder}
                    className="w-full rounded-2xl border-2 border-[#FFE8D6] bg-white p-3 text-sm font-bold text-zinc-800 outline-none focus:border-[#FF8E3C]"
                  />
                </div>

                {/* Detailed description */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1" htmlFor="form-description-textarea">
                    {t.formDescription}
                  </label>
                  <textarea
                    id="form-description-textarea"
                    required
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder={t.formDescriptionPlaceholder}
                    className="w-full rounded-2xl border-2 border-[#FFE8D6] bg-white p-3 text-sm font-bold text-zinc-800 outline-none focus:border-[#FF8E3C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contact Phone */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1" htmlFor="contact-phone-input">
                      {t.formPhone}
                    </label>
                    <input
                      id="contact-phone-input"
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder={t.formPhonePlaceholder}
                      className="w-full rounded-2xl border-2 border-[#FFE8D6] bg-white p-3 text-sm font-bold text-zinc-800 outline-none focus:border-[#FF8E3C]"
                    />
                  </div>

                  {/* Reward field if lost type */}
                  {formType === 'lost' ? (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1" htmlFor="form-reward-input">
                        {t.formReward} ({lang === 'en' ? "Optional" : "არასავალდებულო"})
                      </label>
                      <input
                        id="form-reward-input"
                        type="text"
                        value={formReward}
                        onChange={(e) => setFormReward(e.target.value)}
                        placeholder={t.formRewardPlaceholder}
                        className="w-full rounded-2xl border-2 border-[#FFE8D6] bg-white p-3 text-sm font-bold text-zinc-800 outline-none focus:border-[#FF8E3C]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1" htmlFor="social-link-input">
                        {t.formContactInfo}
                      </label>
                      <input
                        id="social-link-input"
                        type="text"
                        value={formContactInfo}
                        onChange={(e) => setFormContactInfo(e.target.value)}
                        placeholder={t.formContactInfoPlaceholder}
                        className="w-full rounded-2xl border-2 border-[#FFE8D6] bg-white p-3 text-sm font-bold text-zinc-800 outline-none focus:border-[#FF8E3C]"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t-2 border-[#FFE8D6] justify-end">
                  <button
                    id="btn-cancel-form"
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-3 rounded-2xl border-2 border-zinc-200 text-xs font-black text-zinc-620 uppercase tracking-widest leading-none active:translate-y-[2px] transition-all"
                  >
                    {t.formCancel}
                  </button>
                  <button
                    id="btn-submit-form"
                    type="submit"
                    disabled={submittingForm}
                    className="px-6 py-3 rounded-2xl bg-[#FF8E3C] hover:opacity-95 text-white text-xs font-black uppercase tracking-widest leading-none shadow-[0_4px_0_rgba(255,142,60,0.25)] active:translate-y-[2px] transition-all disabled:opacity-50"
                  >
                    {submittingForm ? t.formSaving : t.formSubmit}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Overlay / Display Modal */}
      <AnimatePresence>
        {selectedListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              id="details-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedListing(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />

            <motion.div
              id="details-modal-box"
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFFBF7] p-6 border-4 border-[#F0E6D2] shadow-[0_12px_0_#F0E6D2] text-left"
            >
              <div className="mb-4 flex items-center justify-between border-b-2 border-[#FFE8D6] pb-3 select-none">
                <span className="text-xl font-black text-[#2D3436] font-sans tracking-tight">
                  🐾 {selectedListing.name || (lang === 'en' ? "Animal Report Details" : "განცხადების დეტალები")}
                </span>
                <button
                  id="close-details-modal"
                  onClick={() => setSelectedListing(null)}
                  className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Grid content */}
              <div className="space-y-4">
                
                {/* Photo row */}
                {selectedListing.photo ? (
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-100 shadow-inner">
                    <img 
                      id="details-full-photo" 
                      src={selectedListing.photo} 
                      alt="Full Pet" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full text-white border border-black/10
                        ${selectedListing.type === 'lost' ? 'bg-[#FF6B6B]' : 'bg-[#2CB67D]'}`}>
                        {selectedListing.type === 'lost' ? "LOST" : "FOUND"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-zinc-150 rounded-2xl flex flex-col items-center justify-center text-zinc-400">
                    <span className="text-4xl text-[#FF8E3C] mb-1">🐾</span>
                    <span className="text-xs font-black uppercase text-zinc-500">No Image Provided</span>
                  </div>
                )}

                {/* Subtitle Tags */}
                <div className="flex flex-wrap gap-2 pt-1 font-black text-[10px] uppercase">
                  <span className="px-3 py-1.5 rounded-lg bg-orange-100 text-[#FF8E3C]">
                    {lang === 'en' ? "Category" : "ცხოველი"}: {selectedListing.animalType}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-[#2CB67D]">
                    {lang === 'en' ? "City" : "ქალაქი"}: {geCities.find(c => c.id === selectedListing.city)?.nameEn || selectedListing.city}
                  </span>
                  {selectedListing.reward && (
                    <span className="px-3 py-1.5 rounded-lg bg-amber-400 text-amber-955">
                      💰 Reward: {selectedListing.reward}
                    </span>
                  )}
                  {selectedListing.status === 'reunited' && (
                    <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800">
                      🎉 {t.reunitedLabel}
                    </span>
                  )}
                </div>

                {/* Body Details description */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-base font-black text-zinc-900 uppercase tracking-wide">
                    {lang === 'en' ? "Description Details" : "აღწერილობა"}
                  </h4>
                  <p id="details-text-paragraph" className="text-xs font-bold leading-relaxed text-zinc-650 bg-white p-4 rounded-2xl border-2 border-[#FFE8D6]">
                    {selectedListing.description}
                  </p>
                </div>

                {/* Geolocation attributes list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#FFE8D6] font-bold text-xs text-zinc-700">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-[#FF8E3C] shrink-0" />
                    <div>
                      <p className="text-[10px] text-zinc-405 font-black uppercase leading-none mb-1">Specific Location</p>
                      <span>{selectedListing.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-5 h-5 text-[#4A90E2] shrink-0" />
                    <div>
                      <p className="text-[10px] text-zinc-405 font-black uppercase leading-none mb-1">Incident Date</p>
                      <span>{selectedListing.date}</span>
                    </div>
                  </div>
                </div>

                {/* Main Contact action sheet */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border-2 border-[#FFD3B6] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-[#FF8E3C] uppercase tracking-wider leading-none mb-1">Contact Details</p>
                    <p className="text-xs font-black text-zinc-800 flex items-center gap-1.5">
                      <Phone className="w-4.5 h-4.5 text-zinc-600" />
                      <span>{selectedListing.contactPhone}</span>
                    </p>
                    {selectedListing.contactInfo && (
                      <p className="text-[11px] font-bold text-zinc-500 mt-1 truncate max-w-xs">{selectedListing.contactInfo}</p>
                    )}
                  </div>

                  <a
                    id="contact-phone-call-anchor"
                    href={`tel:${selectedListing.contactPhone}`}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2CB67D] hover:opacity-95 text-white text-xs font-black uppercase tracking-wider shadow-sm text-center"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    <span>{t.contactPoster}</span>
                  </a>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Map City Lost Pets Popup Modal */}
      <AnimatePresence>
        {selectedMapCity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              id="map-city-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMapCity('')}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />

            <motion.div
              id="map-city-modal-box"
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#FFFBF7] p-6 sm:p-8 border-4 border-[#FF8E3C] shadow-[0_12px_0_#FFE8D6] text-left"
            >
              <div className="mb-6 flex items-center justify-between border-b-2 border-[#FFE8D6] pb-4 select-none">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black text-[#2D3436] font-sans tracking-tight">
                      📍 {lang === 'en' ? "Lost Pets in" : "დაკარგული ცხოველები:"} {' '}
                      <span className="text-[#FF8E3C]">
                        {geCities.find(c => c.id === selectedMapCity)?.[lang === 'en' ? 'nameEn' : 'nameKa'] || selectedMapCity}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-zinc-550 font-bold">
                    {lang === 'en' ? "Carefully inspect active reports for this region." : "გთხოვთ ყურადღებით გაეცნოთ ამ ქალაქში დაკარგული ცხოველების აქტიურ განცხადებებს."}
                  </p>
                </div>
                <button
                  id="close-map-city-modal"
                  onClick={() => setSelectedMapCity('')}
                  className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 shrink-0 self-start transition-colors"
                >
                  <X className="w-6 h-6 stroke-[3]" />
                </button>
              </div>

              {/* Modal Body Container */}
              {lostPetsInSelectedCity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-zinc-400 text-center bg-white border-2 border-dashed border-[#FFE8D6] rounded-3xl">
                  <span className="text-6xl mb-4">🐾</span>
                  <h4 className="text-lg font-black text-zinc-700">
                    {lang === 'en' ? "No Lost Pets Reported" : "დაკარგული ცხოველები არ არის"}
                  </h4>
                  <p className="text-xs font-semibold text-zinc-500 mt-2 max-w-sm leading-relaxed">
                    {lang === 'en' 
                      ? "There are currently no active lost animal reports registered in this region. Thank you for patrolling!"
                      : "ამ რეგიონში ამჟამად არ არის რეგისტრირებული დაკარგული ცხოველების აქტიური განცხადებები. გმადლობთ ყურადღებისთვის!"}
                  </p>
                  <button
                    id="map-city-close-btn"
                    onClick={() => setSelectedMapCity('')}
                    className="mt-6 text-xs font-black px-5 py-2.5 rounded-xl bg-[#FF8E3C] text-white vibrant-btn shadow-md active:translate-y-[1px] transition-all"
                  >
                    {lang === 'en' ? "Back to Map" : "რუკაზე დაბრუნება"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-orange-50/50 border border-orange-200 text-[#FF8E3C] p-4 rounded-2xl flex items-center gap-2.5 text-xs font-bold leading-relaxed">
                    <span className="text-xl">📢</span>
                    <span>
                      {lang === 'en' 
                        ? `Found ${lostPetsInSelectedCity.length} active lost report(s) in this city! Help us reunite them by looking through details:` 
                        : `ამ ქალაქში ნაპოვნია ${lostPetsInSelectedCity.length} დაკარგული ცხოველი! დაეხმარეთ მფლობელებს პოვნაში:`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lostPetsInSelectedCity.map(item => (
                      <ListingCard
                        key={item.id}
                        listing={item}
                        lang={lang}
                        onViewDetails={(listing) => {
                          setSelectedListing(listing);
                        }}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={favorites.includes(item.id)}
                        currentUser={user}
                        isAdmin={isAdmin}
                        onEdit={(listing) => handleOpenForm(listing.type, listing)}
                        onDelete={handleDeleteListing}
                        onMarkReunited={handleMarkReunited}
                        isShareSupported={!!navigator.share}
                        onCopySuccess={() => triggerToast(t.shareSuccess)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth modal loader container */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        lang={lang}
      />

    </div>
  );
}

import { 
  collection, doc, addDoc, getDoc, getDocs, query, where, 
  onSnapshot, updateDoc, deleteDoc, serverTimestamp, Timestamp
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { IEventService } from "../interfaces/IEventService";
import type { Event, CreateEventDTO, EventAvailability, TimeSlot } from "../../models/Event";

const EVENTS_COLLECTION = "events";

export class FirestoreEventService implements IEventService {
  
  private mapDocToEvent(docId: string, data: any): Event {
    return {
      id: docId,
      groupId: data.groupId,
      title: data.title,
      description: data.description,
      category: data.category,
      price: data.price,
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
      state: data.state || 'sondage',
      availabilities: data.availabilities || {},
      finalDate: data.finalDate,
      finalTimeSlot: data.finalTimeSlot,
    };
  }

  async getGroupEvents(groupId: string): Promise<Event[]> {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where("groupId", "==", groupId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => this.mapDocToEvent(doc.id, doc.data()));
  }

  subscribeToGroupEvents(groupId: string, callback: (events: Event[]) => void): () => void {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where("groupId", "==", groupId)
    );
    return onSnapshot(q, (snap) => {
      const events = snap.docs.map(doc => this.mapDocToEvent(doc.id, doc.data()));
      callback(events);
    });
  }

  async createEvent(userId: string, userName: string, data: CreateEventDTO): Promise<Event> {
    const eventData = {
      ...data,
      createdBy: userId,
      createdByName: userName,
      createdAt: serverTimestamp(),
      state: 'sondage',
      availabilities: {}
    };
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
    
    return {
      id: docRef.id,
      ...data,
      createdBy: userId,
      createdByName: userName,
      createdAt: Date.now(),
      state: 'sondage',
      availabilities: {}
    };
  }

  async updateEvent(eventId: string, userId: string, data: Partial<CreateEventDTO>, isGroupOwner: boolean): Promise<void> {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) throw new Error("Événement introuvable.");
    
    const eventData = eventSnap.data();
    if (eventData.createdBy !== userId && !isGroupOwner) {
      throw new Error("Droits insuffisants pour modifier cet événement.");
    }
    
    await updateDoc(eventRef, data);
  }

  async deleteEvent(eventId: string, userId: string, isGroupOwner: boolean): Promise<void> {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) throw new Error("Événement introuvable.");
    
    const eventData = eventSnap.data();
    if (eventData.createdBy !== userId && !isGroupOwner) {
      throw new Error("Droits insuffisants pour supprimer cet événement.");
    }
    
    await deleteDoc(eventRef);
  }

  async updateAvailability(eventId: string, userId: string, availability: EventAvailability): Promise<void> {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      [`availabilities.${userId}`]: availability
    });
  }

  async lockEventDate(eventId: string, userId: string, isGroupOwner: boolean, date: string, timeSlot: TimeSlot): Promise<void> {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) throw new Error("Événement introuvable.");
    
    const eventData = eventSnap.data();
    if (eventData.createdBy !== userId && !isGroupOwner) {
      throw new Error("Seul le créateur de l'événement ou le gérant du groupe peut valider la date.");
    }
    
    await updateDoc(eventRef, {
      state: 'planifie',
      finalDate: date,
      finalTimeSlot: timeSlot
    });
  }
}

export const eventService = new FirestoreEventService();

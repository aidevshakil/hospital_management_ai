'use client';
import { useState } from 'react';
import styles from './doctors.module.css';
import Link from 'next/link';

const DUMMY_DOCTORS = [
  { id: 1, name: "Dr. Sarah Jenkins", specialty: "Cardiology", experience: "15 Years", education: "MD, FACC", available: "Mon, Wed, Fri", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "Dr. Robert Chen", specialty: "Neurology", experience: "12 Years", education: "MD, PhD", available: "Tue, Thu", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "Dr. Emily Smith", specialty: "Pediatrics", experience: "8 Years", education: "MD", available: "Mon, Tue, Thu, Fri", image: "https://images.unsplash.com/photo-1594824432258-0097fdb3132e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "Dr. Michael Hasan", specialty: "General Medicine", experience: "20 Years", education: "MBBS, MD", available: "Mon-Sat", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
  { id: 5, name: "Dr. Lisa Wong", specialty: "Surgery", experience: "10 Years", education: "MD, FACS", available: "Wed, Fri", image: "https://images.unsplash.com/photo-1527613426421-41da3084478f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
  { id: 6, name: "Dr. David Kumar", specialty: "Orthopedics", experience: "14 Years", education: "MS Ortho", available: "Mon, Thu, Sat", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
];

const SPECIALTIES = ["All", "Cardiology", "Neurology", "Pediatrics", "General Medicine", "Surgery", "Orthopedics"];

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("All");

  const filteredDoctors = DUMMY_DOCTORS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === "All" || doc.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Our Medical Specialists</h1>
          <p className={styles.subtitle}>Find the right doctor for your healthcare needs.</p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {/* Search and Filter */}
        <div className={styles.filters}>
          <input 
            type="text" 
            placeholder="Search doctor by name..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className={styles.selectInput}
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
          >
            {SPECIALTIES.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Doctor Grid */}
        <div className={styles.grid}>
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className={styles.card}>
              <div className={styles.doctorImageContainer}>
                <img src={doctor.image} alt={doctor.name} className={styles.doctorImage} />
              </div>
              <div className={styles.cardBody}>
                <h3>{doctor.name}</h3>
                <p className={styles.specialty}>{doctor.specialty}</p>
                
                <div className={styles.details}>
                  <p><span>Experience:</span> {doctor.experience}</p>
                  <p><span>Education:</span> {doctor.education}</p>
                  <p><span>Available:</span> {doctor.available}</p>
                </div>
                
                <Link href={`/appointment?doctor=${doctor.id}`} className="btn btn-primary">
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {filteredDoctors.length === 0 && (
          <div className={styles.noResults}>
            <p>No doctors found matching your criteria.</p>
            <button className="btn btn-outline" onClick={() => {setSearchTerm(""); setFilterSpecialty("All")}}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

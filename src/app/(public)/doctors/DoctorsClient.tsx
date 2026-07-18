'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './doctors.module.css';

export interface DoctorCard {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  education: string;
  available: string;
  image: string;
}

export default function DoctorsClient({
  doctors,
  specialties,
}: {
  doctors: DoctorCard[];
  specialties: string[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('All');

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'All' || doc.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
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
          {['All', ...specialties].map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      {/* Doctor Grid */}
      <div className={styles.grid}>
        {filteredDoctors.map((doctor) => (
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
          <button
            className="btn btn-outline"
            onClick={() => { setSearchTerm(''); setFilterSpecialty('All'); }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

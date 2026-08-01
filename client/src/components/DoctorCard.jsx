import { Link } from 'react-router-dom';
import { HiOutlineBriefcase, HiOutlineCurrencyDollar, HiOutlineCalendar } from 'react-icons/hi';
import { UPLOADS_BASE_URL } from '../services/api';

const initials = (name = '') =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const DoctorCard = ({ doctor, showBookButton = false }) => {
  const imageUrl = doctor.profileImage ? `${UPLOADS_BASE_URL}${doctor.profileImage}` : null;

  return (
    <div className="card p-5 flex flex-col hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={doctor.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-teal-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 font-display font-bold flex items-center justify-center text-lg border-2 border-teal-100">
            {initials(doctor.fullName)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-display font-bold text-ink truncate">Dr. {doctor.fullName}</h3>
          <p className="text-sm text-clay-600 font-medium truncate">
            {doctor.specialization || 'General Physician'}
          </p>
          {doctor.qualification && (
            <p className="text-xs text-teal-600/80 truncate">{doctor.qualification}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-sm text-teal-800">
        <span className="flex items-center gap-2">
          <HiOutlineBriefcase className="text-teal-500" />
          {doctor.experience ? `${doctor.experience} years experience` : 'Experience not listed'}
        </span>
        {doctor.consultationFee !== undefined && (
          <span className="flex items-center gap-2">
            <HiOutlineCurrencyDollar className="text-teal-500" />
            {doctor.consultationFee ? `$${doctor.consultationFee} consultation fee` : 'Fee on request'}
          </span>
        )}
        {doctor.availableDays?.length > 0 && (
          <span className="flex items-center gap-2">
            <HiOutlineCalendar className="text-teal-500" />
            {doctor.availableDays.join(', ')}
          </span>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <Link to={`/doctors/${doctor._id}`} className="btn-outline flex-1 !py-2 text-sm">
          View Profile
        </Link>
        {showBookButton && (
          <Link to={`/doctors/${doctor._id}#book`} className="btn-accent flex-1 !py-2 text-sm">
            Book
          </Link>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;

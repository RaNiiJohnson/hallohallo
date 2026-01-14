export const formatDate = (date: Date | string | number) => {
  const dateObj = date instanceof Date ? date : new Date(date);

  const diff = new Date().getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diff / 1000 / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInMonths / 12);

  if (diffInYears > 0) {
    return `il y a ${diffInYears} an${diffInYears > 1 ? "s" : ""}`;
  }
  if (diffInMonths > 0) {
    return `il y a ${diffInMonths} mois`;
  }
  if (diffInDays > 0) {
    return `il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
  }
  if (diffInHours > 0) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
  }
  if (diffInMinutes > 0) {
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  }
  return "maintenant";
};
export const formatProfilDate = (date: Date | string | number) => {
  const dateObj = date instanceof Date ? date : new Date(date);

  const diff = new Date().getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diff / 1000 / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInMonths / 12);

  if (diffInYears > 0 && diffInYears < 2) {
    return `${diffInYears} an`;
  }
  if (diffInYears > 1) {
    return `${diffInYears} ans`;
  }
  if (diffInMonths > 0 && diffInMonths < 2) {
    return `${diffInMonths} mois`;
  }
  if (diffInMonths > 1) {
    return `${diffInMonths} mois`;
  }
  if (diffInDays > 0 && diffInDays < 2) {
    return `${diffInDays} jour`;
  }
  if (diffInDays > 1) {
    return `${diffInDays} jours`;
  }
  if (diffInHours > 0 && diffInHours < 2) {
    return `${diffInHours} heure`;
  }
  if (diffInHours > 1) {
    return `${diffInHours} heures`;
  }
  if (diffInMinutes > 0 && diffInMinutes < 2) {
    return `${diffInMinutes} minute`;
  }
  if (diffInMinutes > 1) {
    return `${diffInMinutes} minutes`;
  }
  return "maintenant";
};

export const getRelativeTime = (date: Date | string | number) => {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 30) {
    return "à l'instant";
  }
  if (diffInSeconds < 60) {
    return `il y a ${diffInSeconds} secondes`;
  }
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  }
  if (diffInHours < 24) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
  }
  if (diffInDays < 7) {
    return `il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
  }
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  }
  const months = Math.floor(diffInDays / 30);
  if (months < 12) {
    return `il y a ${months} mois`;
  }
  const years = Math.floor(months / 12);
  return `il y a ${years} an${years > 1 ? "s" : ""}`;
};

export const dateParser = (num: Date | string | number) => {
  let timestamp: number;

  if (num instanceof Date) {
    // Si num est de type Date, pas besoin de le parser
    timestamp = num.getTime();
  } else {
    // Si num est de type string, le parser
    timestamp = Date.parse(num.toString());
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour12: false,
  };

  const date = new Date(timestamp).toLocaleDateString("fr-FR", options);

  return (
    date.toString().split(",", 2).join(",") +
    " " +
    "à" +
    " " +
    date.toString().split(",").slice(2)
  );
};

export const formatDateLong = (date: Date | string | number) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

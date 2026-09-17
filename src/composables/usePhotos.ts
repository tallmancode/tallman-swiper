import {IPhoto} from "../types";

const usePhoto = (): { getPhotos: () => Promise<IPhoto[]> } => {
  const getPhotos = async (): Promise<IPhoto[]> => {
    const response = await fetch("/api/photos");

    if (!response.ok) {
      throw new Error("Something went wrong. Please try again later.");
    }

    return (await response.json()) as IPhoto[];
  };

  return {
    getPhotos,
  };
};

export default usePhoto;

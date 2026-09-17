import { demoMedia } from "../_demo-media/index.js";
import { demoCars } from "./media/index.js";

const { media: albumMedia, refs: albumRefs, song } = demoMedia(["kid", "party", "city-lights", "balloons", "gift"]);
const { media: carsMedia, refs: carRefs } = demoCars();

const CARS = [
  { name: "Civic Custom", message: "El primero, porque fuiste el primero en creer en mí cuando ni yo lo hacía." },
  { name: "Civic Racing", message: "Por todas las carreras que nos aventamos para llegar a tiempo… y por las que perdimos riéndonos." },
  { name: "Skyline GT-R", message: "Tu favorito. Lo busqué en tres tiendas hasta encontrarlo, y valió cada vuelta." },
  { name: "Nismo plateado", message: "Porque siempre vas a tu ritmo y eso es lo que más admiro de ti." },
  { name: "Camaro ZL1", message: "Rojo, ruidoso y con carácter: igualito a ti un lunes por la mañana." },
  { name: "Camaro SS", message: "El último, para que cuando lo veas te acuerdes de que te quiero un montón." },
];

export default {
  gift: {
    recipientName: "Mateo",
    senderName: "Andrea",
    content: {
      title: "Feliz 30 de septiembre",
      cars: CARS.map((car, i) => ({ ...car, photo: carRefs[i] })),
      palette: "blue",
      message:
        "Sé que desde niño juntas carritos y que cada uno tiene su historia. Por eso este ramo: seis carritos, seis cosas que quería decirte y nunca encuentro el momento.\n\nGracias por acelerar conmigo cuando todo va bien y por frenar a tiempo cuando me paso de vueltas.",
      photos: albumRefs,
      song,
      videos: [],
      finalLine: "Que nunca te falte camino por recorrer",
    },
  },
  media: { ...albumMedia, ...carsMedia },
};

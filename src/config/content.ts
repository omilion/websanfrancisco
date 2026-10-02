// Textos compartidos entre páginas.

export interface ProcessStep {
  title: string;
  text: string;
  /** Ícono: medidas, ideas, cotizacion, diseno, fabricacion, despacho, instalacion o garantia. */
  icon: string;
}

/** Proceso a medida (6 pasos, texto del sitio actual del cliente). Se edita en el ERP; esto es el respaldo. */
export const processSteps: ProcessStep[] = [
  {
    icon: "medidas",
    title: "Toma de medidas",
    text: "Medidas referenciales del espacio. Podemos rectificar más adelante.",
  },
  {
    icon: "ideas",
    title: "Cuéntanos tus ideas",
    text: "En sucursales o vía WhatsApp. Envíanos fotos, planos o bocetos.",
  },
  {
    icon: "cotizacion",
    title: "Cotización y asesoría",
    text: "Elige material, colores y acabados. Te enviamos la propuesta del mueble o proyecto.",
  },
  {
    icon: "diseno",
    title: "Diseño",
    text: "Se estipula el diseño y hacemos los últimos retoques.",
  },
  {
    icon: "fabricacion",
    title: "Fabricación",
    text: "Tu proyecto cobra vida en nuestro taller, en los plazos acordados.",
  },
  {
    icon: "despacho",
    title: "Despacho e instalación",
    text: "Entrega coordinada e instalación. ¡Mueble o proyecto listo para su uso!",
  },
];

/** Tipos de proyecto a medida (página /a-medida y formulario de cotización). */
export const customProjectTypes = [
  {
    slug: "cocina",
    name: "Cocinas",
    text: "Muebles base, aéreos y despensas que aprovechan cada centímetro.",
  },
  {
    slug: "closet",
    name: "Closets",
    text: "Distribución interior pensada para lo que guardas: barras, cajones y repisas.",
  },
  {
    slug: "dormitorio",
    name: "Dormitorios",
    text: "Camas, respaldos, veladores y cómodas que combinan entre sí.",
  },
  {
    slug: "living",
    name: "Living y TV",
    text: "Muebles de TV a muro, bibliotecas y repisas a la medida de tu pared.",
  },
  {
    slug: "comedor",
    name: "Comedores",
    text: "Mesas y bancas del tamaño exacto para tu familia.",
  },
  {
    slug: "otro",
    name: "Proyectos especiales",
    text: "Ese rincón difícil bajo la escalera, un entretecho o un mueble para tu negocio.",
  },
];

export const materials = [
  {
    slug: "encina",
    name: "Encina",
    text: "Madera nativa firme y durable, con una veta marcada que se luce con aceite natural.",
    image: "material-encina.jpg",
  },
  {
    slug: "roble",
    name: "Roble Chiloé",
    text: "Noble y resistente, ideal para muebles de uso diario que pasan de generación en generación.",
    image: "material-roble.jpg",
  },
  {
    slug: "tapiz",
    name: "Tapices y cuero",
    text: "Telas de alto tráfico, lino y cuero para sofás, sillas y respaldos.",
    image: "material-tapiz.jpg",
  },
];

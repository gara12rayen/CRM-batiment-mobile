/**
 * Loads the services that know how to send the field items (each one registers itself in the
 * queue). Imported once by FileEnvoiDemarreur, so an item kept from yesterday can be sent at start.
 */
import "@/features/photos-rapports/services/photosRapports.service";
import "@/features/prospects-terrain/services/prospectsTerrain.service";
import "@/features/sav-terrain/services/sav.service";

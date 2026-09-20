// Configuração única do Leaflet (biblioteca de mapas). Importe `L` sempre daqui.
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconeRetina from 'leaflet/dist/images/marker-icon-2x.png'
import icone from 'leaflet/dist/images/marker-icon.png'
import sombra from 'leaflet/dist/images/marker-shadow.png'

// O bundler (Vite) muda o nome dos arquivos, então os ícones padrão do marcador
// precisam ser apontados manualmente, senão o marcador aparece "quebrado".
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconeRetina,
  iconUrl: icone,
  shadowUrl: sombra,
})

export const CENTRO_BRASIL = [-14.235, -51.925]

export const URL_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export const ATRIBUICAO =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'

export default L

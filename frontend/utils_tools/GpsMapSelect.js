import { React, redux, PropTypes, Loading, axios, connect, elements, utils } from "perun-core";
const { labelsManager } = utils
const { alertUserV2, alertUserResponse } = elements
const { useEffect, useState } = React;
const { store } = redux;
import { ui, core } from '../Map/Spatial';
const { Map, factory } = core;
import { id, center, zoomLevel } from '../Map/config';

const GpsMapSelect = (props, context) => {
    const [layers, setLayers] = useState(null)

    useEffect(() => {
        const layersToRemove = [];
        Map.eachLayer(function(layer) {
            layersToRemove.push(layer);
        });
        layersToRemove.forEach(layer => Map.removeLayer(layer));

        getGeoTypeLayers().then(({ basemap, overlays }) => {
            setLayers({ basemap, overlays })
            const firstGroup = Object.values(basemap)[0]
            const firstLayer = firstGroup && Object.values(firstGroup)[0]
            if (firstLayer) firstLayer.addTo(Map)
            Map.setView(center, zoomLevel);
            Map.on('click', handleMapClick);
        })
        return () => {
            Map.off('click', handleMapClick)
        };
    }, [])

    const getGeoTypeLayers = () => {
        const basemap = {}
        const overlays = {}
        const tableName = 'GEO_LAYER_TYPE'
        const url = `${window.server}/ReactElements/getTableData/${props.session}/${tableName}/0`
        return axios.get(url).then(res => {
            if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                res.data.forEach(geoTypeLayer => {
                    const layerType = geoTypeLayer?.[`${tableName}.LAYER_TYPE`]
                    const layerProtocol = geoTypeLayer?.[`${tableName}.PROTOCOL`]
                    const version = geoTypeLayer?.[`${tableName}.VERSION`] || '1.1.1'
                    const format = geoTypeLayer?.[`${tableName}.FORMAT`] || 'image/png'
                    const layerUrl = geoTypeLayer?.[`${tableName}.URL`]
                    const layerGroup = geoTypeLayer?.[`${tableName}.LAYER_GROUP`] || 'Other'
                    const title = geoTypeLayer?.[`${tableName}.TITLE`]
                    const labelCode = geoTypeLayer?.[`${tableName}.LABEL_CODE`] || title
                    let tileLayer
                    if (layerProtocol?.toLowerCase() === 'wms') {
                        const tileLayerOptions = {
                            layers: title,
                            format,
                            transparent: true,
                            uppercase: true,
                            version,
                            // If the layer is an overlay, set the tiled property for it
                            ...layerType === '2' && { tiled: true },
                            // If the layer is an overlay, mark it as so
                            ...layerType === '2' && { isOverlay: true }
                        }
                        const geoService = layerUrl || server
                        tileLayer = factory.tileLayer.extendedWMS(geoService, tileLayerOptions)
                    } else if (layerProtocol?.toLowerCase() === 'tile') {
                        const geoService = layerUrl || server
                        tileLayer = factory.tileLayer(geoService)
                    }
                    // Set the basemap layers
                    if (layerType === '1') {
                        if (!basemap[layerGroup]) {
                            basemap[layerGroup] = {}
                        }
                        Reflect.set(basemap[layerGroup], labelCode, tileLayer)
                        // Set the overlays
                    } else if (layerType === '2') {
                        if (!overlays[layerGroup]) {
                            overlays[layerGroup] = {}
                        }
                        Reflect.set(overlays[layerGroup], labelCode, tileLayer)
                    }
                })
            }
            return { basemap, overlays }
        }).catch(err => {
            console.error(err)
            alertUserResponse({ response: err })
            return { basemap, overlays }
        })
    }

    const toDMS = (deg) => {
        const d = String(Math.floor(deg)).padStart(2, '0');
        const m = String(Math.floor((deg - d) * 60)).padStart(2, '0');
        const s = String(Math.round((deg - d - m / 60) * 3600)).padStart(2, '0');
        return `${d}°${m}'${s}''`;
    }

    const handleMapClick = (e) => {
        const lat = Number(e.latlng.lat.toFixed(4));
        const lng = Number(e.latlng.lng.toFixed(4));

        alertUserV2({
            type: 'info',
            title: `${labelsManager('confirm_selected_coords', context, 'farm_registry')}`,
            message: `${labelsManager('gps_north', context, 'farm_registry')} ${toDMS(Math.abs(lat))}\n,${labelsManager('gps_east', context, 'farm_registry')} ${toDMS(Math.abs(lng))}`,
            onConfirm: () => props.handleMapClick(toDMS(Math.abs(lat)), toDMS(Math.abs(lng))),
            showCancel: true,
            cancelButtonText: `${labelsManager('cancel', context, 'farm_registry')}`
        })
    };

    if (!layers) return <Loading />

    return (
        <div className={'holding-map-container'}>
            {ui.init(store.getState().security.svSession)
                .addRasterLayers(layers.basemap, layers.overlays, { collapsed: true })
                .render(id, true)}
        </div>
    );
};

GpsMapSelect.contextTypes = {
    intl: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    session: state.security.svSession,
})

export default connect(mapStateToProps)(GpsMapSelect)

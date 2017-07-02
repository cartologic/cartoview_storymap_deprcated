import React, { Component } from 'react';
import { Collapse, Button } from 'reactstrap';
import Loading from './Loading.jsx';
import ol from 'openlayers';
import {getUrlWithQS} from '../utils/utils.jsx';

const isWMSLayer = (layer) => {
  return layer.getSource() instanceof ol.source.TileWMS || layer.getSource() instanceof ol.source.ImageWMS;
}
const getWMSLayer = (name, layers) => {
    var wmsLayer = null;
    layers.forEach((layer) => {
        if (layer instanceof ol.layer.Group) {
            wmsLayer = getWMSLayer(name, layer.getLayers());
        }
        else if(isWMSLayer(layer)
          && layer.getSource().getParams().LAYERS == name) {
            wmsLayer = layer;
        }
        if (wmsLayer) {
            return false
        }
    });
    return wmsLayer;
};


class FeatureList extends Component {
  state = {}
  componentDidMount() {
    const {layerName, map} = this.props;
    const url = getUrlWithQS(URLS.geoserver + 'wfs', {
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typename: layerName,
      outputFormat: 'application/json',
      srsname: 'EPSG:3857'
    });
    fetch(url).then(res => res.json()).then(res => {
      this.setState({features: res.features})
    })
  }
  items(features){
    const {listItemTpl } = this.props;

    return features.map((f) => {
      const text = listItemTpl.replace(/\{{2}\w+\}{2}/gm, (match) => {
        const propName = match.substr(2, match.length -4)
        return f.properties[propName];
      });
      const onFeatureSelected = (e) => {
        e.preventDefault();
        this.props.onFeatureSelected(f);
      }
      return <li onClick={onFeatureSelected} className="list-group-item list-group-item-action">
        <span>{text}</span>
        <a className="btn btn-link float-right" href="#"><i className="fa fa-ellipsis-v" aria-hidden="true"></i></a>

      </li>
    })
  }
  render() {
    const {features, errors} = this.state;
    if(!features && !errors) return <Loading />;
    const {className=""} = this.props;
    //console.log(getWMSLayer(layerName, map.getLayers().getArray()));

    return (
      <div className={className + ' feature-list-ct'}>
        <div className="list-group">
          {this.items(features)}
        </div>
      </div>
    );
  }
}

export default FeatureList;

var Calculation = {
    stage : 'calculation',
    reservedColor : '#1B9E77',
    suffixes : ['_intersects'],
    description : {
        'stage' : '<p>Rates or erosion or deposition are calculated at the location of each transect using the user-defined statistics and parameters found within the Manage tab.</p><hr />DSAS rates can be calculated using the collection of features in the current workspace.',
        'view-tab' : '',
        'manage-tab' : '',
        'upload-button' : ''
    },
			
    appInit : function() {
    },
    
    leaveStage : function() {
        LOG.info('Calculation.js::leaveStage');
    },
    enterStage : function() {
        LOG.info('Calculation.js::enterStage');
        CONFIG.ui.switchTab({
            stage : 'intersections',
            tab : 'view'
        })
    },
    populateFeaturesList : function(args) {
        CONFIG.ui.populateFeaturesList({
            caller : Calculation,
            stage : 'intersections'
        });
    },
    clear : function() {
        $("#intersections-list").val('');
        Calculation.listboxChanged();
    },
    listboxChanged : function() {
        LOG.info('Calculation.js::listboxChanged: Intersections listbox changed');
        CONFIG.tempSession.getStage('intersections').viewing = '';
        $("#intersections-list option:not(:selected)").each(function (index, option) {
            var layers = CONFIG.map.getMap().getLayersBy('name', option.value);
            if (layers.length) {
                $(layers).each(function(i,l) {
                    CONFIG.map.getMap().removeLayer(l, false);
                })
            }
        });
        if ($("#intersections-list option:selected")[0].value) {
            var name = $("#intersections-list option:selected")[0].value; 
            Calculation.addIntersections({
                name : name
            })
            CONFIG.tempSession.getStage('intersections').viewing = name;
        }
        CONFIG.tempSession.persistSession();
    },
    addIntersections : function(args) {
        var intersections = new OpenLayers.Layer.WMS(
            args.name, 
            'geoserver/' + args.name.split(':')[0] + '/wms',
            {
                layers : args.name,
                transparent : true,
                sld_body : Calculation.createSLDBody({
                    layerName : args.name
                })
            },
            {
                isBaseLayer : false,
                unsupportedBrowsers: [],
                tileOptions: {
                    // http://www.faqs.org/rfcs/rfc2616.html
                    // This will cause any request larger than this many characters to be a POST
                    maxGetUrlLength: 2048
                },
                singleTile: true, 
                ratio: 1,
				displayInLayerSwitcher : false
            });
        intersections.type="intersections";	
        CONFIG.map.getMap().addLayer(intersections);
        intersections.redraw(true);
    },
    createSLDBody : function(args) {
        var sldBody = '';
        
        sldBody += '<?xml version="1.0" encoding="ISO-8859-1"?>' + 
        '<StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + 
        '<NamedLayer>' +
        '<Name>' + args.layerName + '</Name>' + 
        '<UserStyle>' + 
        '<FeatureTypeStyle>' + 
        '<Rule>' + 
        '<PointSymbolizer>' + 
        '<Graphic>' + 
        '<Mark>' + 
        '<WellKnownName>circle</WellKnownName>' + 
        '<Fill>' + 
        '<CssParameter name="fill">' + Calculation.reservedColor + '</CssParameter>' + 
        '</Fill>' + 
        '<Stroke>' + 
        '<CssParameter name="stroke">#000000</CssParameter>' + 
        '<CssParameter name="stroke-width">2</CssParameter>' + 
        '</Stroke>' + 
        '</Mark>' + 
        '<Size>6</Size>' + 
        '</Graphic>' + 
        '</PointSymbolizer>' + 
        '</Rule>' + 
        '</FeatureTypeStyle>' +
        '</UserStyle>' + 
        '</NamedLayer>' + 
        '</StyledLayerDescriptor>'
        return sldBody;
    },
    getActive : function() {
        return $("#intersections-list option:selected").first().val();
    }
}

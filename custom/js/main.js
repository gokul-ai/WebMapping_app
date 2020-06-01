
// All Global Variable
var draw
var flagIsDrawingOn = false
var refl = false
var selectedGeomType
var flagIsEditOn = false
var layerArray = []
var map
var modify 
// Custom popup
// Popup overlay with popupClass=anim
var popup = new ol.Overlay.Popup ({
    popupClass: "default anim", //"tooltips", "warning" "black" "default", "tips", "shadow",
    closeBox: true,
    onclose: function(){ console.log("You close the box"); },
    positioning: 'auto',
    autoPan: true,
    autoPanAnimation: { duration: 100 }
  });
// Custom Control
 /**
       * Define a namespace for the application.
       */
      window.app = {};
      var app = window.app;


      //
      // Define rotate to north control.
      //


      /**
       * @constructor
       * @extends {ol.control.Control}
       * @param {Object=} opt_options Control options.
       */


// View
var myview = new ol.View({
	 projection:'EPSG:4326',
    center : [106.91772040734844,-6.108386914919473],
    zoom:14
})

// OSM Layer
var baseLayer = new ol.layer.Tile({
    source : new ol.source.OSM({
        attributions:'Surveyor Application'
    })
})

var highlightStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 1
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255,0,0,0)'
    }),
    text: new ol.style.Text({
      font: '12px Calibri,sans-serif',
      fill: new ol.style.Fill({
        color: '#000'
      }),
      stroke: new ol.style.Stroke({
        color: '#f00',
        width: 3
      }),
    })
  });    
// 1 . Define source

var drawSource = new ol.source.Vector()
// 2. Define layer
var drawLayer = new ol.layer.Vector({
    source: drawSource,
  
})	


 var wkt_arr= []; 
 var name ="";
 var rad_arr=[];
 var coord_arr=[];
 var dist=[];
 var ty=[];
$.ajax({
  type:"GET",
  dataType: "json",
  url: "http://34.87.19.200:8080/LogisticOnlineService/District/Public/Search",
  success: function(data){
	  
	  var cw = Object.keys(data.Value).length;
	
		for (var i = 0; i < cw; i++) {
			dist.push(data.Value[i].districtID)
			ty.push(data.Value[i].geofence.type)
  if(data.Value[i].geofence.lng==0){
	  name = data.Value[i].name
  var btn_val = "Add";
  var color = "orange"
  }
  else{
	var btn_val = "Modify "; 
	var color = "lightgreen"
  }
		var rec ='<tr id='+i+'><td style="text-align:center">'+(i+1)+
		'</td><td style="text-align:center">'+data.Value[i].geofenceID+
		'</td><td style="text-align:center">'+data.Value[i].districtID+
		'</td><td style="text-align:center">'+data.Value[i].geofence.lat+
		'</td><td style="text-align:center">'+data.Value[i].geofence.lng+
		'</td><td style="text-align:center"><button  class="use-address" style="height:30px;width:70px;background:'+color+'">'+btn_val+'</button></td></tr>';
		$("table").append(rec);
		if(data.Value[i].geofence.geofence!==undefined && data.Value[i].geofence.lat!==0.0 && data.Value[i].geofence.lng!==0.0){
			if(data.Value[i].geofence.type==0 && data.Value[i].geofence.radius!==0.0){
				var rre = data.Value[i].geofence.radius
				var c_arr=[data.Value[i].geofence.lng,data.Value[i].geofence.lat]
			rad_arr.push(rre)
			coord_arr.push(c_arr)
			}else {
				//var wkt =data.Value[i].geofence.geofence
				//var wkt = JSON.stringify(data.Value[i].geofence.geofence
			wkt_arr.push(data.Value[i].geofence.geofence)
			
		}	
		} 
    }
    vectorSource = new ol.source.Vector({
          projection: 'EPSG:4326'
      });
		for (var i=0;i<Object.values(coord_arr).length;i++){
				for (var j=0;j<Object.values(rad_arr).length;j++){	
				ccr = coord_arr[i]
				
		var circle = new ol.geom.Circle(coord_arr[i],rad_arr[i]);
        var circleFeature = new ol.Feature(circle);
		
        // Source and vector layer
        //
        vectorSource.addFeature(circleFeature);
        
  }
  vectorLayer = new ol.layer.Vector({
    source: vectorSource,
style : function(circleFeature) {
highlightStyle.getText().setText(name);
return highlightStyle;
}
});	
}
map.addLayer(vectorLayer);
	//console.log(Object.values(wkt_arr)[1])
		for (var i=0;i < Object.values(wkt_arr).length;i++){
			
		//wkt = wkt_arr[i]
		var format = new ol.format.WKT()
	for (var i in wkt_arr) {
		
    var feature = format.readFeatures(wkt_arr[i])
	drawSource1 = new ol.source.Vector({
	features: feature
	})
	drawLayer1 = new ol.layer.Vector({
    source : drawSource1,
	style : function(feature) {
        highlightStyle.getText().setText(name);
        return highlightStyle;}
		 })
		 map.addLayer(drawLayer1);
	}
		
		}

		
		
  }
})

map = new ol.Map({
    controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false
        }
      }),
    target : 'mymap',
    view: myview,
    layers:[baseLayer,drawLayer],
    overlays:[popup]
})

	
// Function to start Drawing
var wkt_geom = '';
var wkt = '';
var lang='';
var lat='';
var rad='';
var type='';
var cen ='';
function startDraw(geomType){
    selectedGeomType = geomType
    draw = new ol.interaction.Draw({
        type:geomType,
        source:drawSource
    })
   
    map.addInteraction(draw)
    draw.on('drawend', function(evt){
		wkt_geom = evt;
        console.log(evt)
        if (geomType == 'Circle'){
			type=1
			rad = wkt_geom.feature.getGeometry().getRadius()
			console.log(rad)
			lng = wkt_geom.feature.getGeometry().getCenter()[0]
			lat = wkt_geom.feature.getGeometry().getCenter()[1]
			wkt = "POINT("+lng+" "+lat+")"
			console.log(wkt)
			cen = wkt_geom.feature.getGeometry().getCenter()
			console.log(wkt_geom.feature.getGeometry().getCenter())
            evt.feature.setProperties({'area': 3.14*evt.feature.getGeometry().getRadius()*evt.feature.getGeometry().getRadius()})
        } else {
            evt.feature.setProperties({'area': evt.feature.getGeometry().getArea()})
        console.log(evt.feature.get('area'))
		var type = 2
		lng = wkt_geom.feature.getGeometry().getCoordinates()[0][0][0]
		lat = wkt_geom.feature.getGeometry().getCoordinates()[0][0][1]
		var format = new ol.format.WKT();
		wkt= format.writeGeometry(wkt_geom.feature.getGeometry())
		rad = 0
		console.log(wkt)
		  
		}
		pst()
    map.removeInteraction(draw)
 
     })
     
}

// -------------------_Edit features_------------------- 

var startGeom , endGeom, feat, changedfit,featgeom,endRad, selectGeomtype,select
// var select = new ol.interaction.Select({
    // wrapX: false
	
	
  // });
    // select.on('select', function(evt){
        // if (evt.selected.length > 0){
  		  // feat=evt.selected[0]
     // console.log(feat)
      // if( feat.getGeometry().getType() == 'Polygon'){
  		// console.log(evt.selected[0])
          // featgeom =  feat.getGeometry().getCoordinates()
      // }else {
  		// console.log(evt.selected[0].getGeometry().getType())
          // featgeom = feat.getGeometry().getRadius()
      // }
  // } else {
      // $('#editsave').modal('show')
  // }

  // })

  // modify.on('modifystart', function(evt){
    
    // startGeom =  feat.getGeometry()

// })


  function editgeom(Saveflag){
	  
      if (Saveflag){
		  
        if( changedfit.getGeometry().getType() == 'Polygon'){
			type = 1
			lng = changedfit.getGeometry().getCoordinates()[0][0][0]
			lat = changedfit.getGeometry().getCoordinates()[0][0][1]
			rad = 0
			var format = new ol.format.WKT();
			wkt= format.writeGeometry(changedfit.getGeometry())
			console.log(wkt)	
            changedfit.setProperties({'area': changedfit.getGeometry().getArea()        })
			
			
        }else{
			// type=0
			// rad = changedfit.getGeometry().getRadius()
			// console.log(rad)
			// lng = changedfit.getGeometry().getCenter()[0]
			// lat = changedfit.getGeometry().getCenter()[1]
			// wkt = "POINT("+lng+" "+lat+")"
        changedfit.setProperties({'area': 3.14*changedfit.getGeometry().getRadius()*changedfit.getGeometry().getRadius()})
        
		$('#myModal').modal('show');
		}  
    }else{
        // if( changedfit.getGeometry().getType() == 'Polygon'){	
            // changedfit.getGeometry().setCoordinates(featgeom)
			
        // } else {
           // rad = changedfit.getGeometry().setRadius(featgeom)

        // }
      }
	
  }
    
// -------------------_Edit features_------------------- 

var D_id = '';
var Geo_id='';
var btn_vl;
$("#myTable").on('click','.use-address',function ter(){	
         // get the current row
		 
		 
         var currentRow=$(this).closest("tr"); 
         var cur = currentRow;
         var col1=currentRow.find("td:eq(0)").text(); // get current row 1st TD value
         var col2=currentRow.find("td:eq(1)").text(); // get current row 2nd TD
         var col3=currentRow.find("td:eq(2)").text(); // get current row 3rd TD
         var col5=currentRow.find("td:eq(5)").text(); // get current row 3rd TD
		 
		 Geo_id = col2
		 D_id = col3
		 btn_vl =col5
	map.removeInteraction(select)
     $('#myModal').modal('hide');
	 map.removeInteraction(select)
			if(btn_vl=="Add"){
				
				if(ty[dist.indexOf(D_id)]==0){
					console.log(ty[dist.indexOf(D_id)])
					startDraw('Circle')
				}else{
					
					startDraw('Polygon')
				}
			}else{
				map.removeInteraction(select)
        feat = vectorLayer.getSource().getFeatures()[parseInt([currentRow[0].id])]
        select = new ol.interaction.Select({
              wrapX: false,
              features :new ol.Collection([feat])

            });
            modify = new ol.interaction.Modify({
                features :  select.getFeatures(),
              })
			 
         modify.on('modifyend', function(evt){
          changedfit = evt.features.a[0]
          if( changedfit.getGeometry().getType() == 'Polygon'){
              modifiedgeom =changedfit.getGeometry().getCoordinates()

          }else{
              modifiedgeom = changedfit.getGeometry().getRadius()
          }
          
          $('#editsave').modal('show')
		  
		  
        })
		map.addInteraction(select)
        map.addInteraction(modify)

		
			}
	  })

console.log(D_id)

function pst(){
	console.log(Geo_id)
	console.log(D_id)
	
 	fetch('http://34.87.19.200:8080/LogisticOnlineService/District/Public/Geofence/', {
		method: 'POST',
		headers: {
     'Content-Type': 'application/json'
  },
body:JSON.stringify({
		
		"districtID":D_id,
		"geofenceID":Geo_id,
		"type":type,
		"radius":rad,
		"lat":lat,
		"lng":lng,
		"geofence":wkt
})
})
.then(data => {
  console.log('Success:', data);
})
.catch((error) => {
  console.error('Error:', error);
});
// location.reload();
}
	

// Function to save information in db 
function savetodb(){
    // get array of all features 
    var featureArray = drawSource.getFeatures()
    // Define geojson format 
    var geogJONSformat = new ol.format.GeoJSON()
    // Use method to convert feature to geojson
    var featuresGeojson = geogJONSformat.writeFeaturesObject(featureArray)
    // Array of all geojson
    var geojsonFeatureArray = featuresGeojson.features
    console.log(geojsonFeatureArray)
   

// Update layer
var params = featureLayer.getSource().getParams();
params.t = new Date().getMilliseconds();
featureLayer.getSource().updateParams(params);

// Close the Modal
// $("#enterInformationModal").modal('hide')

// clearDrawSource ()

}


function clearDrawSource (){
    drawSource.clear()
}


// Geolocation 
  // set up geolocation to track our position
  var geolocation = new ol.Geolocation({
    tracking: true,
    //projection : map.getView().getProjection(),
    enableHighAccuracy: true,
  });

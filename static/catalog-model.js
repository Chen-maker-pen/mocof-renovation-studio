// Pure catalog rules shared by rendering, placement and regression checks.
function catalogCanPlace(row){return !!row&&['products','brands','wall-art','design-items','sample-furniture','layouts'].includes(row.kind);}
function catalogSourceName(row){return String(row.name||row.name_as_shown||row.design_name||row.model_reference||'Catalog item');}
function catalogBilingualName(row){const name=catalogSourceName(row);return row.name_en&&row.name_en!==name?name+' · '+row.name_en:name;}
function catalogFootprint(row){
 const unit=String(row.dimension_unit||row.dimension_units||'').toLowerCase();
 const factor={m:1,metres:1,meters:1,mm:.001,cm:.01}[unit];
 let values=[row.width,row.depth,row.height].map(Number);
 if((!values.every(v=>v>0))&&row.dimensions_raw)values=String(row.dimensions_raw).split(/[x×*]/i).map(Number);
 if(factor&&values.length===3&&values.every(v=>Number.isFinite(v)&&v>0)&&values[0]*factor<=100&&values[1]*factor<=100&&values[2]*factor<=6)return {width:values[0]*factor,depth:values[1]*factor,height:values[2]*factor,dimension_status:'source_units_available',dimensions_confirmed:false,height_confirmed:false};
 return {width:.6,depth:.6,height:.75,dimension_status:'schematic_unverified',dimensions_confirmed:false,height_confirmed:false};
}

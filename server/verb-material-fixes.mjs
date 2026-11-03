// Versioned display/input corrections; original source snapshot remains immutable.
const replacements={
 '2010':[['(chercher) un responsable','(chercher) ______ un responsable']],
 '2012':[['(raconter) <u>-moi</u>','(raconter) ______ <u>-moi</u>'],['<u>(parvenir)</u> <u>au premier étage</u>','<u>(parvenir)</u> ______ <u>au premier étage</u>'],['(porter) <u>une robe blanche</u>','(porter) ______ <u>une robe blanche</u>'],['<u>(lire)</u> <u>un roman attentivement</u>','<u>(lire)</u> ______ <u>un roman attentivement</u>']],
 '2013':[['(être) <u>petite</u>','(être) ______ <u>petite</u>']],
 '2014':[["l'<u>*être*</u> toujours","l'<u>*être*</u> ______ toujours"]]
};
const fixed=new Set(['2010-V13','2012-V01','2012-V15','2012-V16','2012-V17','2013-V02','2014-V13']);
export function correctedVerbMapping(mapping){
 if(!mapping.type.startsWith('verb_'))return mapping;
 const patches=replacements[mapping.itemId.split('-')[0]];if(!patches)return mapping;
 const apply=text=>{if(!text)return text;for(const [from,to] of patches){if(text.includes(from))text=text.replace(from,to);}return text;};
 const material=mapping.material?{...mapping.material,text:apply(mapping.material.text)}:null;
 const repaired=fixed.has(mapping.itemId)&&material?.text!==mapping.material?.text;
 return {...mapping,stem:apply(mapping.stem),material,...(repaired?{type:'verb_blank',originalType:mapping.type,displayCorrectionVersion:'verb-material-fixes-v1'}:{})};
}

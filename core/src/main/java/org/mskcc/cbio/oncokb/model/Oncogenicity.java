

package org.mskcc.cbio.oncokb.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author jgao
 */
public enum Oncogenicity {
    YES ("Oncogenic"),
    LIKELY ("Likely Oncogenic"),
    LIKELY_NEUTRAL ("Likely Neutral"),
    INCONCLUSIVE ("Inconclusive");
    
    private Oncogenicity(String oncogenic) {
        this.oncogenic = oncogenic;
    }
    
    private final String oncogenic;

    public String getOncogenic() {
        return oncogenic;
    }
    
    private static final Map<String, Oncogenicity> map = new HashMap<String, Oncogenicity>();
    static {
        for (Oncogenicity levelOfEvidence : Oncogenicity.values()) {
            map.put(levelOfEvidence.getOncogenic(), levelOfEvidence);
        }
    }
    
    
    /**
     *
     * @param level
     * @return
     */
    public static Oncogenicity getByLevel(String level) {
        return map.get(level);
    }
    
    public static int compare(Oncogenicity o1, Oncogenicity o2){
        //0 indicates o1 has the same oncogenicity with o2
        //positive number indicates o1 has higher oncogenicity than o2
        //negative number indicates o2 has higher oncogenicity than o1
        List<String> oncogenicityValues = new ArrayList<>(Arrays.asList("Inconclusive", "Likely Neutral", "Likely Oncogenic", "Oncogenic"));
        if(o1 == null && o2 == null)return 0;
        else if(o1 == null) return -1;
        else if(o2 == null)return 1;
        else return oncogenicityValues.indexOf(o1.getOncogenic()) - oncogenicityValues.indexOf(o2.getOncogenic());
    }

}

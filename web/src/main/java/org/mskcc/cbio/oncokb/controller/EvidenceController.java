/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.mskcc.cbio.oncokb.controller;

import io.swagger.annotations.ApiParam;
import org.mskcc.cbio.oncokb.bo.AlterationBo;
import org.mskcc.cbio.oncokb.bo.EvidenceBo;
import org.mskcc.cbio.oncokb.bo.GeneBo;
import org.mskcc.cbio.oncokb.model.*;
import org.mskcc.cbio.oncokb.util.AlterationUtils;
import org.mskcc.cbio.oncokb.util.ApplicationContextSingleton;
import org.mskcc.cbio.oncokb.util.EvidenceUtils;
import org.mskcc.cbio.oncokb.util.MainUtils;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * @author jgao
 */
@Controller
public class EvidenceController {
    @RequestMapping(value = "/legacy-api/evidence.json", method = RequestMethod.GET)
    public @ResponseBody List<List<Evidence>> getEvidence(
        HttpMethod method,
        @RequestParam(value = "entrezGeneId", required = false) String entrezGeneId,
        @RequestParam(value = "hugoSymbol", required = false) String hugoSymbol,
        @RequestParam(value = "alteration", required = false) String alteration,
        @RequestParam(value = "tumorType", required = false) String tumorType,
        @RequestParam(value = "evidenceType", required = false) String evidenceType,
        @RequestParam(value = "consequence", required = false) String consequence,
        @RequestParam(value = "proteinStart", required = false) String proteinStart,
        @RequestParam(value = "proteinEnd", required = false) String proteinEnd,
        @RequestParam(value = "geneStatus", required = false) String geneStatus,
        @RequestParam(value = "source", required = false) String source,
        @RequestParam(value = "levels", required = false) String levels,
        @RequestParam(value = "highestLevelOnly", required = false) Boolean highestLevelOnly) {

        List<List<Evidence>> evidences = new ArrayList<>();

        Map<String, Object> requestQueries = MainUtils.GetRequestQueries(entrezGeneId, hugoSymbol, alteration,
            tumorType, evidenceType, consequence, proteinStart, proteinEnd, geneStatus, source, levels);

        if (requestQueries == null) {
            return new ArrayList<>();
        }

        List<EvidenceQueryRes> evidenceQueries = EvidenceUtils.processRequest(
            (List<Query>) requestQueries.get("queries"),
            new HashSet<>((List<EvidenceType>) requestQueries.get("evidenceTypes")),
            geneStatus, source, new HashSet<>((List<LevelOfEvidence>) requestQueries.get("levels")), highestLevelOnly);

        if (evidenceQueries != null) {
            for (EvidenceQueryRes query : evidenceQueries) {
                evidences.add(query.getEvidences());
            }
        }

        return evidences;
    }

    @RequestMapping(value = "/legacy-api/evidence.json", method = RequestMethod.POST)
    public @ResponseBody List<EvidenceQueryRes> getEvidence(
        @RequestBody EvidenceQueries body) {

        List<EvidenceQueryRes> result = new ArrayList<>();
        if (body.getQueries().size() > 0) {
            List<Query> requestQueries = body.getQueries();
            Set<EvidenceType> evidenceTypes = new HashSet<>();

            if (body.getEvidenceTypes() != null) {
                for (String type : body.getEvidenceTypes().split("\\s*,\\s*")) {
                    EvidenceType et = EvidenceType.valueOf(type);
                    evidenceTypes.add(et);
                }
            } else if (body.getEvidenceTypes().isEmpty()) {
                // If the evidenceTypes has been defined but is empty, no result should be returned.
                return result;
            } else {
                evidenceTypes.add(EvidenceType.GENE_SUMMARY);
                evidenceTypes.add(EvidenceType.GENE_BACKGROUND);
            }

            result = EvidenceUtils.processRequest(requestQueries, evidenceTypes, null, body.getSource(),
                body.getLevels(), body.getHighestLevelOnly());
        }

        return result;
    }

    @RequestMapping(value="/legacy-api/evidences/update/{uuid}", method = RequestMethod.POST)
    public @ResponseBody String updateEvidence(@ApiParam(value = "uuid", required = true) @PathVariable("uuid") String uuid,
            @RequestBody(required = true) Evidence queryEvidence) {
        EvidenceBo evidenceBo = ApplicationContextSingleton.getEvidenceBo();

        EvidenceType evidenceType = queryEvidence.getEvidenceType();
        String subType = queryEvidence.getSubtype();
        String cancerType = queryEvidence.getCancerType();
        String knownEffect = queryEvidence.getKnownEffect();
        LevelOfEvidence level = queryEvidence.getLevelOfEvidence();
        String description = queryEvidence.getDescription();
        String additionalInfo = queryEvidence.getAdditionalInfo();
        Date lastEdit = queryEvidence.getLastEdit();

        //List<Evidence> evidences = EvidenceUtils.getEvidenceByUUID(uuid);
        List<Evidence> evidences = evidenceBo.findEvidenceByUUIDs(Collections.singletonList(uuid));
        if(evidences.isEmpty()){
            Evidence evidence = new Evidence();
            GeneBo geneBo = ApplicationContextSingleton.getGeneBo();
            Gene gene = geneBo.findGeneByHugoSymbol(queryEvidence.getGene().getHugoSymbol());

            AlterationType type = AlterationType.MUTATION;
            Set<Alteration> queryAlterations = queryEvidence.getAlterations();
            Set<Alteration> alterations = new HashSet<Alteration>();
            AlterationBo alterationBo = ApplicationContextSingleton.getAlterationBo();
            for (Alteration alt : queryAlterations) {
                String proteinChange = alt.getAlteration();
                String displayName = alt.getName();
                Alteration alteration = alterationBo.findAlteration(gene, type, proteinChange);
                if (alteration == null) {
                    alteration = new Alteration();
                    alteration.setGene(gene);
                    alteration.setAlterationType(type);
                    alteration.setAlteration(proteinChange);
                    alteration.setName(displayName);
                    AlterationUtils.annotateAlteration(alteration, proteinChange);
                    alterationBo.save(alteration);
                }
                alterations.add(alteration);
            }
            evidence.setAlterations(alterations);
            evidence.setUuid(uuid);
            evidence.setGene(gene);
            evidence.setEvidenceType(evidenceType);
            evidence.setSubtype(subType);
            evidence.setCancerType(cancerType);
            evidence.setKnownEffect(knownEffect);
            evidence.setLevelOfEvidence(level);
            evidence.setDescription(description);
            evidence.setAdditionalInfo(additionalInfo);
            evidence.setLastEdit(lastEdit);

            evidenceBo.save(evidence);
            evidences.add(evidence);
        }else{
            for(Evidence evidence : evidences){
                evidence.setEvidenceType(evidenceType);
                evidence.setSubtype(subType);
                evidence.setCancerType(cancerType);
                evidence.setKnownEffect(knownEffect);
                evidence.setLevelOfEvidence(level);
                evidence.setDescription(description);
                evidence.setAdditionalInfo(additionalInfo);
                evidence.setLastEdit(lastEdit);

                evidenceBo.update(evidence);
            }
        }

        //CacheUtils.setEvidenceByUUID(evidences);
        return "success";
    }

    @RequestMapping(value = "/legacy-api/evidences/delete", method = RequestMethod.POST)
    public
    @ResponseBody
    String deleteEvidences(@RequestBody(required = true) List<String> uuids) {
        EvidenceBo evidenceBo = ApplicationContextSingleton.getEvidenceBo();
        if (uuids != null) {
            List<Evidence> evidences = evidenceBo.findEvidenceByUUIDs(uuids);
            evidenceBo.deleteAll(evidences);
        }
        return "";
    }

    @RequestMapping(value = "/legacy-api/evidences/delete/{uuid}", method = RequestMethod.DELETE)
    public
    @ResponseBody
    String deleteEvidence(@ApiParam(value = "uuid", required = true) @PathVariable("uuid") String uuid) {
        EvidenceBo evidenceBo = ApplicationContextSingleton.getEvidenceBo();
        List<Evidence> evidences = evidenceBo.findEvidenceByUUIDs(Collections.singletonList(uuid));
        evidenceBo.deleteAll(evidences);
        return "";
    }


}

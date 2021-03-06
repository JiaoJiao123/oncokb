package org.mskcc.cbio.oncokb.model;
// Generated Dec 19, 2013 1:33:26 AM by Hibernate Tools 3.2.1.GA

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.mskcc.cbio.oncokb.util.TumorTypeUtils;

import java.util.Date;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;


/**
 * Evidence generated by hbm2java
 */
public class Evidence implements java.io.Serializable {
    @JsonIgnore
    private Integer id;
    @JsonIgnore
    private String uuid;
    private EvidenceType evidenceType;

    private String cancerType;
    private String subtype;
    private OncoTreeType oncoTreeType;
    private Gene gene;
    private Set<Alteration> alterations;
    private String description;
    private String additionalInfo;
    private Set<Treatment> treatments;
    private String knownEffect;
    private Date lastEdit;
    private LevelOfEvidence levelOfEvidence;
    private Set<Article> articles;
    private Set<NccnGuideline> nccnGuidelines = new HashSet<NccnGuideline>(0);
    private Set<ClinicalTrial> clinicalTrials = new HashSet<ClinicalTrial>(0);

    public Evidence() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public EvidenceType getEvidenceType() {
        return evidenceType;
    }

    public void setEvidenceType(EvidenceType evidenceType) {
        this.evidenceType = evidenceType;
    }

    public String getCancerType() {
        return cancerType;
    }

    public void setCancerType(String cancerType) {
        this.cancerType = cancerType;
    }

    public String getSubtype() {
        return subtype;
    }

    public void setSubtype(String subtype) {
        this.subtype = subtype;
    }

    public void setOncoTreeType(OncoTreeType oncoTreeType) {
        this.oncoTreeType = oncoTreeType;
    }

    public OncoTreeType getOncoTreeType() {
        if (this.oncoTreeType != null)
            return this.oncoTreeType;

        OncoTreeType oncoTreeType = null;

        if (this.subtype != null) {
            oncoTreeType = TumorTypeUtils.getOncoTreeSubtypeByCode(this.subtype);
        } else if (this.cancerType != null) {
            oncoTreeType = TumorTypeUtils.getOncoTreeCancerType(this.cancerType);
        }

        return oncoTreeType;
    }

    public Gene getGene() {
        return gene;
    }

    public void setGene(Gene gene) {
        this.gene = gene;
    }

    public Set<Alteration> getAlterations() {
        return alterations;
    }

    public void setAlterations(Set<Alteration> alterations) {
        this.alterations = alterations;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public Set<Treatment> getTreatments() {
        return treatments;
    }

    public void setTreatments(Set<Treatment> treatments) {
        this.treatments = treatments;
    }

    public String getKnownEffect() {
        return knownEffect;
    }

    public void setKnownEffect(String knownEffect) {
        this.knownEffect = knownEffect;
    }

    public Date getLastEdit() {
        return lastEdit;
    }

    public void setLastEdit(Date lastEdit) {
        this.lastEdit = lastEdit;
    }

    public LevelOfEvidence getLevelOfEvidence() {
        return levelOfEvidence;
    }

    public void setLevelOfEvidence(LevelOfEvidence levelOfEvidence) {
        this.levelOfEvidence = levelOfEvidence;
    }

    public Set<Article> getArticles() {
        return articles;
    }

    public void setArticles(Set<Article> articles) {
        this.articles = articles;
    }

    public void addArticles(Set<Article> articles) {
        if (this.articles == null) {
            this.articles = articles;
        } else {
            for (Article article : articles) {
                if (!this.articles.contains(article)) {
                    this.articles.add(article);
                }
            }
        }
    }

    public Set<NccnGuideline> getNccnGuidelines() {
        return nccnGuidelines;
    }

    public void setNccnGuidelines(Set<NccnGuideline> nccnGuidelines) {
        this.nccnGuidelines = nccnGuidelines;
    }

    public Set<ClinicalTrial> getClinicalTrials() {
        return clinicalTrials;
    }

    public void setClinicalTrials(Set<ClinicalTrial> clinicalTrials) {
        this.clinicalTrials = clinicalTrials;
    }

    public void addClinicalTrials(Set<ClinicalTrial> clinicalTrials) {
        if (this.clinicalTrials == null) {
            this.clinicalTrials = clinicalTrials;
        } else {
            for (ClinicalTrial trial : clinicalTrials) {
                if (!this.clinicalTrials.contains(trial)) {
                    this.clinicalTrials.add(trial);
                }
            }
        }
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 67 * hash + Objects.hashCode(this.id == null ? this : this.id);
        return hash;
    }


    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final Evidence other = (Evidence) obj;
        if (this.id == null || other.id == null ||
            !Objects.equals(this.id, other.id)) {
            return false;
        }
        return true;
    }

    public Evidence(Evidence e) {
        id = e.id;
        uuid = e.uuid;
        evidenceType = e.evidenceType;
        cancerType = e.cancerType;
        subtype = e.subtype;
        gene = e.gene;
        alterations = e.alterations;
        description = e.description;
        additionalInfo = e.additionalInfo;
        treatments = e.treatments;
        knownEffect = e.knownEffect;
        lastEdit = e.lastEdit;
        levelOfEvidence = e.levelOfEvidence;
        articles = e.articles;
        nccnGuidelines = e.nccnGuidelines;
        clinicalTrials = e.clinicalTrials;
    }
}



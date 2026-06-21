/**
 * @fileoverview Main entry point for EcoTrack application.
 * Handles DOM event delegation, initialization of UI components, and
 * wiring up of event listeners for all interactive elements.
 * @module app
 */

"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const el_auto_bind_1 = document.getElementById('auto-bind-1');
    if(el_auto_bind_1) el_auto_bind_1.addEventListener('click', (event) => {
        showProfileModal();
    });
    const el_auto_bind_2 = document.getElementById('auto-bind-2');
    if(el_auto_bind_2) el_auto_bind_2.addEventListener('click', (event) => {
        document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
    });
    const el_auto_bind_3 = document.getElementById('auto-bind-3');
    if(el_auto_bind_3) el_auto_bind_3.addEventListener('click', (event) => {
        loadDemoData();
    });
    const el_auto_bind_4 = document.getElementById('auto-bind-4');
    if(el_auto_bind_4) el_auto_bind_4.addEventListener('click', (event) => {
        applyPreset('chennai-weekday');
    });
    const el_auto_bind_5 = document.getElementById('auto-bind-5');
    if(el_auto_bind_5) el_auto_bind_5.addEventListener('click', (event) => {
        applyPreset('low-impact');
    });
    const el_auto_bind_6 = document.getElementById('auto-bind-6');
    if(el_auto_bind_6) el_auto_bind_6.addEventListener('click', (event) => {
        applyPreset('high-impact');
    });
    const el_auto_bind_7 = document.getElementById('auto-bind-7');
    if(el_auto_bind_7) el_auto_bind_7.addEventListener('click', (event) => {
        applyPreset('reset');
    });
    const el_car_km = document.getElementById('car-km');
    if(el_car_km) el_car_km.addEventListener('input', (event) => {
        updateSliderValue('car-km');
    });
    const el_car_km_num = document.getElementById('car-km-num');
    if(el_car_km_num) el_car_km_num.addEventListener('change', (event) => {
        syncSlider('car-km');
    });
    const el_public_km = document.getElementById('public-km');
    if(el_public_km) el_public_km.addEventListener('input', (event) => {
        updateSliderValue('public-km');
    });
    const el_public_km_num = document.getElementById('public-km-num');
    if(el_public_km_num) el_public_km_num.addEventListener('change', (event) => {
        syncSlider('public-km');
    });
    const el_electricity = document.getElementById('electricity');
    if(el_electricity) el_electricity.addEventListener('input', (event) => {
        updateSliderValue('electricity');
    });
    const el_electricity_num = document.getElementById('electricity-num');
    if(el_electricity_num) el_electricity_num.addEventListener('change', (event) => {
        syncSlider('electricity');
    });
    const el_auto_bind_8 = document.getElementById('auto-bind-8');
    if(el_auto_bind_8) el_auto_bind_8.addEventListener('click', (event) => {
        calculateAndShowResults();
    });
    const el_auto_bind_9 = document.getElementById('auto-bind-9');
    if(el_auto_bind_9) el_auto_bind_9.addEventListener('click', (event) => {
        hideResults();
    });
    const el_auto_bind_10 = document.getElementById('auto-bind-10');
    if(el_auto_bind_10) el_auto_bind_10.addEventListener('click', (event) => {
        logCurrentToHistory();
    });
    const el_auto_bind_11 = document.getElementById('auto-bind-11');
    if(el_auto_bind_11) el_auto_bind_11.addEventListener('click', (event) => {
        applyWhatIf('metro');
    });
    const el_auto_bind_12 = document.getElementById('auto-bind-12');
    if(el_auto_bind_12) el_auto_bind_12.addEventListener('click', (event) => {
        applyWhatIf('diet');
    });
    const el_auto_bind_13 = document.getElementById('auto-bind-13');
    if(el_auto_bind_13) el_auto_bind_13.addEventListener('click', (event) => {
        applyWhatIf('energy');
    });
    const el_auto_bind_14 = document.getElementById('auto-bind-14');
    if(el_auto_bind_14) el_auto_bind_14.addEventListener('click', (event) => {
        resetWhatIf();
    });
    const el_auto_bind_15 = document.getElementById('auto-bind-15');
    if(el_auto_bind_15) el_auto_bind_15.addEventListener('click', (event) => {
        exportHistory();
    });
    const el_auto_bind_16 = document.getElementById('auto-bind-16');
    if(el_auto_bind_16) el_auto_bind_16.addEventListener('click', (event) => {
        clearHistory();
    });
    const el_auto_bind_17 = document.getElementById('auto-bind-17');
    if(el_auto_bind_17) el_auto_bind_17.addEventListener('click', (event) => {
        showSourcesModal();
    });
    const el_profile_modal = document.getElementById('profile-modal');
    if(el_profile_modal) el_profile_modal.addEventListener('click', (event) => {
        if (event.target.id === 'profile-modal') hideProfileModal();
    });
    const el_auto_bind_18 = document.getElementById('auto-bind-18');
    if(el_auto_bind_18) el_auto_bind_18.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
    });
    const el_auto_bind_19 = document.getElementById('auto-bind-19');
    if(el_auto_bind_19) el_auto_bind_19.addEventListener('click', (event) => {
        hideProfileModal();
    });
    const el_auto_bind_20 = document.getElementById('auto-bind-20');
    if(el_auto_bind_20) el_auto_bind_20.addEventListener('click', (event) => {
        saveProfile();
    });
    const el_auto_bind_21 = document.getElementById('auto-bind-21');
    if(el_auto_bind_21) el_auto_bind_21.addEventListener('click', (event) => {
        hideProfileModal();
    });
    const el_sources_modal = document.getElementById('sources-modal');
    if(el_sources_modal) el_sources_modal.addEventListener('click', (event) => {
        if (event.target.id === 'sources-modal') hideSourcesModal();
    });
    const el_auto_bind_22 = document.getElementById('auto-bind-22');
    if(el_auto_bind_22) el_auto_bind_22.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
    });
    const el_auto_bind_23 = document.getElementById('auto-bind-23');
    if(el_auto_bind_23) el_auto_bind_23.addEventListener('click', (event) => {
        hideSourcesModal();
    });
});

// Event delegation for dynamically rendered items
document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('[data-action="delete"]');
    if (deleteBtn) {
        const idx = parseInt(deleteBtn.getAttribute('data-idx'));
        const date = deleteBtn.getAttribute('data-date');
        deleteHistoryEntry(idx, date);
    }
});



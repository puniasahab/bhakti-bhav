// src/constants/analytics/ga4Events.js
// GA4 Event Names
// All event names follow snake_case convention consistently
// Key name and string value must always match exactly

export const GA4Events = {

    // ─── SPLASH SCREEN ────────────────────────────────────────────
    // done
    website_splash_screen_displayed     : "website_splash_screen_displayed",

    // ─── SCREEN VIEW ──────────────────────────────────────────────
    // done
    screen_view                         : "screen_view",

    // ─── HOME SCREEN & DASHBOARD ──────────────────────────────────
    // done
    panchang_card_clicked               : "panchang_card_clicked",
    // done
    main_banner_clicked                 : "main_banner_clicked",
    // pending 
    festival_card_clicked               : "festival_card_clicked",        // ✅ fix: cilcked → clicked
    // pending
    daily_quote_clicked                 : "daily_quote_clicked",
    // pending
    rashifal_tab_clicked                : "rashifal_tab_clicked",
    // pending
    rashifal_category_screen_opened     : "rashifal_category_screen_opened",
    // pending
    rashifal_category_card_clicked      : "rashifal_category_card_clicked",
    // pending
    rashifal_widget_clicked             : "rashifal_widget_clicked",
    // done
    vrat_katha_widget_clicked           : "vrat_katha_widget_clicked",
    // done
    jaap_mala_widget_clicked            : "jaap_mala_widget_clicked",
    // done
    mantra_widget_clicked               : "mantra_widget_clicked",
    // done
    chalisa_widget_clicked              : "chalisa_widget_clicked",
    // done
    aarti_widget_clicked                : "aarti_widget_clicked",
    // done
    login_icon_clicked                  : "login_icon_clicked",
    wallpaper_widget_clicked            : "wallpaper_widget_clicked",
    suvichar_whatsapp_clicked           : "suvichar_whatsapp_clicked",
    suvichar_pdf_clicked                : "suvichar_pdf_clicked",
    pooja_karein_widget_clicked         : "pooja_karein_widget_clicked",
    // done
    instagram_icon_clicked              : "instagram_icon_clicked",       // ✅ fix: instgram + duplicate _clicked
    // done
    facebook_icon_clicked               : "facebook_icon_clicked",        // ✅ fix: duplicate _clicked
    // done
    whatsapp_icon_clicked               : "whatsapp_icon_clicked",        // ✅ fix: duplicate _clicked

    // ─── LOGIN & AUTH ─────────────────────────────────────────────
    login_screen_opened                 : "login_screen_opened",
    login_otp_requested                 : "login_otp_requested",
    free_login_cta_clicked              : "free_login_cta_clicked",
    skip_login_cta_clicked              : "skip_login_cta_clicked",
    submit_number                       : "submit_number",
    otp_screen_opened                   : "otp_screen_opened",
    verify_otp_clicked                  : "verify_otp_clicked",
    resend_otp_button_clicked           : "resend_otp_button_clicked",

    // ─── HINDU & CHALISA CALENDAR ─────────────────────────────────
    calendar_month_changed              : "calendar_month_changed",
    calendar_festival_date_clicked      : "calendar_festival_date_clicked",
    chalisa_selected                    : "chalisa_selected",
    chalisa_share_cta_clicked           : "chalisa_share_cta_clicked",
    chalisa_hearing_cta_clicked         : "chalisa_hearing_cta_clicked",

    // ─── MANTRAS, BHAJAN & AUDIO ──────────────────────────────────
    mantra_selected                     : "mantra_selected",
    audio_play                          : "audio_play",
    audio_pause                         : "audio_pause",
    audio_complete                      : "audio_complete",
    audio_seek                          : "audio_seek",
    audio_loop_toggled                  : "audio_loop_toggled",
    font_size_changed                   : "font_size_changed",

    // ─── VRAT KATHA & PUJA GUIDE ──────────────────────────────────
    vrat_katha_selected                 : "vrat_katha_selected",
    vrat_katha_read_50                  : "vrat_katha_read_50",
    vrat_katha_read_complete            : "vrat_katha_read_complete",
    vrat_katha_shared                   : "vrat_katha_shared",
    vrat_katha_hear_cta_clicked         : "vrat_katha_hear_cta_clicked",
    aarti_cta_tapped_on_vrat_katha      : "aarti_cta_tapped_on_vrat_katha",

    // ─── JAAP MALA ────────────────────────────────────────────────
    mantra_jaap_category_screen_view    : "mantra_jaap_category_screen_view",
    jaap_session_started                : "jaap_session_started",
    jaap_bead_next_arrow_tapped         : "jaap_bead_next_arrow_tapped",
    jaap_bead_previous_arrow_tapped     : "jaap_bead_previous_arrow_tapped",
    jaap_mala_completed                 : "jaap_mala_completed",

    // ─── RASHIFAL / HOROSCOPE ─────────────────────────────────────
    // done
    rashi_selected                      : "rashi_selected",
    // done
    rashifal_viewed                     : "rashifal_viewed",
    // done
    rashifal_pop_up_closed              : "rashifal_pop_up_closed",

    // ─── WALLPAPERS & SPIRITUAL IMAGES ────────────────────────────
    // done
    wallpaper_category_selected         : "wallpaper_category_selected",
    // not filter options given 
    wallpaper_filter_applied            : "wallpaper_filter_applied",
    // done
    wallpaper_viewed                    : "wallpaper_viewed",
    // done
    wallpaper_download_icon_clicked     : "wallpaper_download_icon_clicked",
    // repeated
    wallpaper_download_cta_clicked      : "wallpaper_download_cta_clicked",
    // done
    wallpaper_share_cta_clicked         : "wallpaper_share_cta_clicked",

    // ─── SUBSCRIPTION & PAYMENTS ──────────────────────────────────
    subscription_option_clicked         : "subscription_option_clicked",
    subscription_plans_screen_viewed    : "subscription_plans_screen_viewed",
    subscription_plan_selected          : "subscription_plan_selected",
    subscription_start_cta_clicked      : "subscription_start_cta_clicked",
    subscription_payment_failed         : "subscription_payment_failed",   // ✅ fix: Subscrioption → subscription
    subscription_payment_success        : "subscription_payment_success",  // ✅ fix: PascalCase → snake_case
    transaction_option_clicked          : "transaction_option_clicked",
    transaction_screen_viewed           : "transaction_screen_viewed",
    terms_and_condition_option_clicked  : "terms_and_condition_option_clicked", // ✅ fix: n → and
    privacy_policy_viewed               : "privacy_policy_viewed",
    logout_clicked                      : "logout_clicked",

    // ─── ERRORS & EDGE CASES ──────────────────────────────────────
    network_error                       : "network_error",
    audio_load_error                    : "audio_load_error",
    app_exception                       : "app_exception",
    content_load_error                  : "content_load_error",
};
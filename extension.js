/*
 * Copyright (C) 2015 Jonny Lamb <jonnylamb@jonnylamb.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Lang = imports.lang;

const Shell = imports.gi.Shell;

// Import the convenience.js (Used for loading settings schemas)
const Self = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Self.imports.convenience;

// Import config
const config = Self.imports.config;

let notify_id = 0;
let visible = true;

function init() {
    this.settings = Convenience.getSettings();
    // Catch use shortcut toggle config change
    this.settings.connect('changed::' +
        config.SETTINGS_USE_TOGGLE_SHORTCUT, Lang.bind(this, refreshBindings));
}

function enable() {
    if (settings.get_boolean(config.SETTINGS_USE_TOGGLE_SHORTCUT))
        addKeybindings(config.SETTINGS_TOGGLE_SHORTCUT, toggleTray);
    hideTray();
}

function disable() {
    removeKeybindings(config.SETTINGS_TOGGLE_SHORTCUT);
    showTray();
}

function showTray() {
    visible = true;
    if (notify_id > 0)
        Main.legacyTray.actor.disconnect(notify_id);
    notify_id = 0;

    Main.legacyTray.actor.show();
}

function hideTray() {
    visible = false;
    Main.legacyTray.actor.hide();

    notify_id = Main.legacyTray.actor.connect("notify::visible", function() {
        if (Main.legacyTray.actor.visible)
            Main.legacyTray.actor.hide();
    });
}

function toggleTray() {
    if (visible)
        hideTray();
    else
        showTray();
}

function addKeybindings(name, handler) {
    if (Main.wm.addKeybinding) {
        var ModeType = Shell.hasOwnProperty('ActionMode') ?
            Shell.ActionMode : Shell.KeyBindingMode;
        Main.wm.addKeybinding(name, this.settings, Meta.KeyBindingFlags.NONE,
             ModeType.NORMAL | ModeType.OVERVIEW, handler);
    } else {
        global.display.add_keybinding(name, this.settings,
             Meta.KeyBindingFlags.NONE, handler);
    }
}

function removeKeybindings(name) {
    if (Main.wm.removeKeybinding) {
        Main.wm.removeKeybinding(name);
    }
    else {
        global.display.remove_keybinding(name);
    }
}

function refreshBindings() {
    disable();
    enable();
}

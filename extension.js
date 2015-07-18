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

let notify_id = 0;

function init() {
}

function enable() {
    Main.legacyTray.actor.hide();

    /* so elegant */

    notify_id = Main.legacyTray.actor.connect("notify::visible", function() {
        if (Main.legacyTray.actor.visible)
            Main.legacyTray.actor.hide();
    });
}

function disable() {
    if (notify_id > 0)
        Main.legacyTray.actor.disconnect(notify_id);
    notify_id = 0;

    Main.legacyTray.actor.show();
}

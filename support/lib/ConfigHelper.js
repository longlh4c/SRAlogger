/* eslint-disable no-prototype-builtins */
import moment from 'moment';
import bookingDomains from '../settings/booking-domains.json';
import brandsSettings from '../settings/brands-settings.json';

class ConfigHelper {
    getTimesheetURL() {
        return bookingDomains.baseUrl;
    }
}

export default new ConfigHelper();

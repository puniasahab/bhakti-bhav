import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TermsPolicy() {
    return (
        <>
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-4xl text-gray-800 font-eng">
                <div className="mb-6 p-4 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-2">Terms Specific to the App</h2>
 
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">Fees & Subscriptions</h3>
                        <p className="mb-2">
                            Bhakti Bhav may charge a subscription fee to Users in consideration for the use of certain aspects of the Bhakti Bhav App. Bhakti Bhav reserves the right to revisit and revise its subscription fees and amounts at its sole discretion. The Services shall be available to users with different modes of subscription. Bhakti Bhav reserves its right to modify the different modes of subscription at its sole discretion. Bhakti Bhav shall advise users of any changes to any modes of subscription thereon after.
                        </p>
                        <p className="mb-2">
                            The subscription period for the Services you purchase shall commence on the date on which the Services are made available to you (the “Subscription Term”).
                        </p>
                        <p className="mb-2">
                            Notwithstanding anything in these Terms of Service, upon a termination of this Agreement or a cancellation of any Service on the App, including any subscription, the Services shall only be cancelled at the end of the duration for which the Service has been paid for.
                        </p>
                        <p className="mb-2">
                            If the Services are terminated prior to the end of a duration that has been paid, the Services, including any Bhakti Bhav features, shall remain available until the end of the duration paid for. You will have the right to access and use the Services for the remaining period of the duration in which you cancel your Account. A user can still access Bhakti Bhav App for the duration of the remaining period.
                        </p>
                        <p>
                            Upon the expiration of the Subscription Term or earlier cancellation of your Account as described in these Terms, your rights to access and use the Services shall terminate and your Account shall be deactivated, except to the extent expressly provided otherwise in these Terms.
                        </p>
                    </div>
 
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">Penalties</h3>
                        <p>
                            A user is liable for no penalty post the cancellation of subscription. If the application cancels a subscription of a user due to a suspicious activity, the user would get an email to showcase the reasons for the same.
                        </p>
                    </div>
 
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
                        <p>If you have any questions about this Privacy Policy, You can contact us:</p>
                        <ul className="list-disc pl-6">
                            <li>By email: XXXXXXXXXX</li>
                        </ul>
                    </div>
                </div>

            </div>

            <Footer />
        </>
    );
}

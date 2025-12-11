            const paymentProofBuffer = Buffer.from(
              input.paymentProofBase64.split(',')[1] || input.paymentProofBase64,
              'base64'
            );

            const paymentProofResult = await uploadPaymentProof(
              registrationNumber,
              paymentProofBuffer,
              input.paymentProofMimeType
            );

            if (paymentProofResult.success) {
              paymentProofUrl = paymentProofResult.webViewLink;
              console.log('[Registration] Payment proof uploaded to Google Drive:', paymentProofUrl);
            } else {
              console.error('[Registration] Failed to upload payment proof:', paymentProofResult.error);
            }

            // Upload parental consent if participant is minor
            if (input.isMinor && input.parentalConsentBase64 && input.parentalConsentMimeType) {
              const consentBuffer = Buffer.from(
                input.parentalConsentBase64.split(',')[1] || input.parentalConsentBase64,
                'base64'
              );

              const consentResult = await uploadParentalConsent(
                registrationNumber,
                consentBuffer,
                input.parentalConsentMimeType
              );

              if (consentResult.success) {
                parentalConsentUrl = consentResult.webViewLink;
                console.log('[Registration] Parental consent uploaded to Google Drive:', parentalConsentUrl);
              } else {
                console.error('[Registration] Failed to upload parental consent:', consentResult.error);
              }
            }
          } catch (error) {
            console.error('[Registration] Google Drive upload error:', error);
            // Continue with registration even if upload fails
          }
        } else {
          console.warn('[Registration] Google Drive not configured, skipping file upload');
        }

        // Simpan data pendaftaran ke database
        const registration = await createRegistration({
          registrationNumber,
          ...input,
          saweriaLink,
          paymentStatus: "pending_verification", // Set to pending_verification since payment proof uploaded
          photoLink,
          paymentProofUrl,
          nik: input.nik,
          invoiceId,
          invoiceAmount,
          kiaNumber: input.kiaNumber,
          parentalConsentUrl,
          isMinor: input.isMinor ? 1 : 0,
        });

        // Kirim email konfirmasi (async, tidak blocking)
        sendEmail({
          to: input.email,
          subject: `Konfirmasi Pendaftaran Audisi - ${registration.registrationNumber}`,
          html: generateRegistrationConfirmationEmail({
            name: input.fullName,
            registrationNumber: registration.registrationNumber,
            category: input.category,
            province: registration.province,
            saweriaLink: registration.saweriaLink || '',
            invoiceId: registration.invoiceId || '',
            invoiceAmount: registration.invoiceAmount || PAYMENT_AMOUNT,
          }),
        }).catch(error => {
          console.error('[Registration] Failed to send confirmation email:', error);
          // Don't fail the registration if email fails
        });

package io.mosip.testrig.pmpuiv2.fw.util;

import static io.restassured.RestAssured.given;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.interfaces.RSAPublicKey;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.json.JSONObject;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import io.mosip.testrig.pmpuiv2.authentication.fw.util.RestClient;
import io.mosip.testrig.pmpuiv2.kernel.util.ConfigManager;
import io.mosip.testrig.pmpuiv2.kernel.util.KeycloakUserManager;
import io.mosip.testrig.pmpuiv2.utility.BaseTestCaseFunc;
import io.mosip.testrig.pmpuiv2.utility.TestRunner;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

public class PmpTestUtil extends BaseTestCaseFunc {

	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(RestClient.class);
	public static String token;
	public static String user;
	public static String tokenRoleIdRepo = "idrepo";
	public static String tokenRoleAdmin = "admin";
	private static String serverComponentsCommitDetails;
	public static String propsHealthCheckURL = TestRunner.getResourcePath() + "/"
			+ "config/healthCheckEndpoint.properties";
	public static boolean initialized = false;

	public static DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
	public static DateTimeFormatter nonZeroPadderDateFormatter = DateTimeFormatter.ofPattern("M/d/yyyy");
	public static DateTimeFormatter monthYearFormatter = DateTimeFormatter.ofPattern("MMMM yyyy");
	public static DateTimeFormatter yyyyMmDdFormatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
	public static DateTimeFormatter yyyyMmmDdFormatter = DateTimeFormatter.ofPattern("yyyy-MMM-dd");
	public static DateTimeFormatter yyyyMmDdFormatter2 = DateTimeFormatter.ofPattern("yyyy.MM.dd");	
	public static String todayDate = LocalDate.now().format(dateFormatter);
	public static String todayDateWithoutZeroPadder = LocalDate.now().format(nonZeroPadderDateFormatter);
	public static String expiryDate = LocalDate.now().plusWeeks(2).format(dateFormatter);
	public static String todayDay = LocalDate.parse(todayDate, dateFormatter).format(DateTimeFormatter.ofPattern("dd"));
	public static String nextMonth24thDate = LocalDate.now().plusMonths(2).withDayOfMonth(24).format(dateFormatter);
	public static String nextMonth24thDateWithoutZeroPadder = LocalDate.now().plusMonths(2).withDayOfMonth(24)
			.format(nonZeroPadderDateFormatter);
	public static String previousMonth4thDateWithoutZeroPadder = LocalDate.now().minusMonths(1).withDayOfMonth(4)
			.format(nonZeroPadderDateFormatter);
	public static String currentMonthAndYear = LocalDate.now().format(monthYearFormatter);

	public static String getServerComponentsDetails() {
		if (serverComponentsCommitDetails != null && !serverComponentsCommitDetails.isEmpty())
			return serverComponentsCommitDetails;

		File file = new File(propsHealthCheckURL);
		FileReader fileReader = null;
		BufferedReader bufferedReader = null;
		StringBuilder stringBuilder = new StringBuilder();
		try {
			fileReader = new FileReader(file);
			bufferedReader = new BufferedReader(fileReader);
			String line;

			while ((line = bufferedReader.readLine()) != null) {
				if (line.trim().equals("") || line.trim().startsWith("#"))
					continue;
				String[] parts = line.trim().split("=");
				if (parts.length > 1) {
					if (ConfigManager.isInServiceNotDeployedList(parts[1])) {
						continue;
					}
					stringBuilder.append("\n")
							.append(getCommitDetails(BaseTestCaseFunc.ApplnURI + parts[1].replace("health", "info")));
				}
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
		} finally {
			PmpTestUtil.closeBufferedReader(bufferedReader);
			PmpTestUtil.closeFileReader(fileReader);
		}
		serverComponentsCommitDetails = stringBuilder.toString();
		return serverComponentsCommitDetails;
	}

	public static void closeBufferedReader(BufferedReader bufferedReader) {
		if (bufferedReader != null) {
			try {
				bufferedReader.close();
			} catch (IOException e) {
				// logger.error(GlobalConstants.EXCEPTION_STRING_2 + e.getMessage());
			}
		}
	}

	public static void closeFileReader(FileReader fileReader) {
		if (fileReader != null) {
			try {
				fileReader.close();
			} catch (IOException e) {
				// logger.error(GlobalConstants.EXCEPTION_STRING_2 + e.getMessage());
			}
		}
	}

	public static String getCommitDetails(String path) {

		Response response = null;
		response = given().contentType(ContentType.JSON).get(path);
		if (response != null && response.getStatusCode() == 200) {
			logger.info(response.getBody().asString());
			JSONObject jsonResponse = new JSONObject(response.getBody().asString());
			return "Group: " + jsonResponse.getJSONObject("build").getString("group") + ", Artifact: "
					+ jsonResponse.getJSONObject("build").getString("artifact") + ", version: "
					+ jsonResponse.getJSONObject("build").getString("version") + ", Commit ID: "
					+ jsonResponse.getJSONObject("git").getJSONObject("commit").getString("id");
		}
		return path + "- No Response";
	}

	public static String UserMapping() {
		return user;

	}

	public static void initialize() {
		if (initialized == false) {
			ConfigManager.init();
			String admin_userName = "admin_userName";
			String zone = "CSB";
			BaseTestCaseFunc.initialize();
			HashMap<String, List<String>> attrmap = new HashMap<String, List<String>>();
			List<String> list = new ArrayList<String>();
			String val = "11000000";
			list.add(val);
			attrmap.put("individualId", list);
			KeycloakUserManager.createUsers();
			BaseTestCaseFunc.mapUserToZone(
					BaseTestCaseFunc.currentModule + "-" + propsKernel.getProperty(admin_userName), zone);
			BaseTestCaseFunc.mapZone(BaseTestCaseFunc.currentModule + "-" + propsKernel.getProperty(admin_userName));
			initialized = true;
		}
	}

	public static String generateJWKPublicKey() {
		try {
			KeyPairGenerator keyGenerator = KeyPairGenerator.getInstance("RSA");
			SecureRandom secureRandom = new SecureRandom();
			keyGenerator.initialize(2048, secureRandom);
			final KeyPair keypair = keyGenerator.generateKeyPair();
			RSAKey jwk = new RSAKey.Builder((RSAPublicKey) keypair.getPublic()).keyID("RSAKeyID")
					.keyUse(KeyUse.SIGNATURE).privateKey(keypair.getPrivate()).build();

			return jwk.toJSONString();
		} catch (NoSuchAlgorithmException e) {
			logger.error(e.getMessage());
			return null;
		}
	}
	
	public static String getResourceFilePath(String folderName, String fileName) {
		return Paths.get(TestRunner.getResourcePath(), folderName, fileName).toString();
	}
}
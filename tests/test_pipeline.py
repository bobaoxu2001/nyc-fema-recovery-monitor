import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from fema_pipeline import (  # noqa: E402
    attach_duplicate_groups,
    choose_project_identifier,
    encode_public_snapshot,
    missing_critical_fields,
    parse_number,
    transform_projects,
    validate_snapshot,
)
from nyc_classify import classify_nyc  # noqa: E402


class ParseTests(unittest.TestCase):
    def test_parse_number_nulls_and_negatives(self):
        self.assertIsNone(parse_number(None))
        self.assertIsNone(parse_number(""))
        self.assertIsNone(parse_number("abc"))
        self.assertEqual(parse_number("1,250.50"), 1250.50)
        self.assertEqual(parse_number(-12.5), -12.5)


class NycTests(unittest.TestCase):
    def test_borough_county(self):
        reasons = classify_nyc(county="Kings County", applicant_name="Some Hospital")
        self.assertIn("borough_county", reasons)

    def test_applicant_name_nyc_token(self):
        reasons = classify_nyc(county="Statewide", applicant_name="NYC Department of Parks")
        self.assertIn("applicant_name", reasons)

    def test_does_not_tag_upstate(self):
        reasons = classify_nyc(
            county="Delaware County",
            applicant_name="Town of Delhi",
            applicant_city="Delhi",
        )
        self.assertEqual(reasons, [])


class IdentifierTests(unittest.TestCase):
    def test_prefers_unique_gm_project_id(self):
        rows = [
            {"gmProjectId": 1, "disasterNumber": 1, "pwNumber": 1, "applicantId": "a", "hash": "h1"},
            {"gmProjectId": 2, "disasterNumber": 1, "pwNumber": 2, "applicantId": "a", "hash": "h2"},
        ]
        result = choose_project_identifier(rows)
        self.assertEqual(result["identifier"], "gmProjectId")
        self.assertTrue(result["safeToSumFederalShare"])


class DuplicateAndMissingTests(unittest.TestCase):
    def test_missing_fields(self):
        missing = missing_critical_fields(
            {
                "disasterNumber": 4085,
                "applicantId": "x",
                "applicationTitle": "",
                "damageCategoryDescrip": None,
                "damageCategoryCode": None,
                "federalShareObligated": None,
            },
            "Unknown applicant",
        )
        self.assertIn("applicationTitle", missing)
        self.assertIn("workCategory", missing)
        self.assertIn("federalShareObligated", missing)
        self.assertIn("applicantName", missing)

    def test_duplicate_looking_groups(self):
        rows = [
            {
                "disasterNumber": 4085,
                "applicantId": "a",
                "applicationTitle": "Debris Removal - Site 1",
                "federalShareObligated": 1000,
            },
            {
                "disasterNumber": 4085,
                "applicantId": "a",
                "applicationTitle": "debris removal  site 1",
                "federalShareObligated": 1004,
            },
            {
                "disasterNumber": 4085,
                "applicantId": "a",
                "applicationTitle": "Something else",
                "federalShareObligated": 1000,
            },
        ]
        stats = attach_duplicate_groups(rows)
        self.assertEqual(stats["records"], 2)
        self.assertIsNotNone(rows[0]["duplicateGroup"])
        self.assertEqual(rows[0]["duplicateGroup"], rows[1]["duplicateGroup"])
        self.assertIsNone(rows[2]["duplicateGroup"])


class TransformTests(unittest.TestCase):
    def test_join_and_no_row_loss(self):
        projects = [
            {
                "disasterNumber": 4085,
                "declarationDate": "2012-10-30T00:00:00.000Z",
                "incidentType": "Hurricane",
                "pwNumber": 9,
                "applicationTitle": "Coney Island Boardwalk",
                "applicantId": "047-51000-00",
                "damageCategoryCode": "G",
                "damageCategoryDescrip": "Parks, Recreational, and Other",
                "projectStatus": "Eligible",
                "projectProcessStep": "Obligated",
                "projectSize": "Large",
                "county": "Kings County",
                "stateAbbreviation": "NY",
                "projectAmount": 5000000,
                "federalShareObligated": 3750000,
                "totalObligated": 3750000,
                "lastObligationDate": "2014-01-01",
                "firstObligationDate": "2013-01-01",
                "gmProjectId": 111,
                "hash": "abc123",
            }
        ]
        applicants = [
            {
                "disasterNumber": 4085,
                "applicantId": "047-51000-00",
                "applicantName": "City of New York",
                "city": "Brooklyn",
            }
        ]
        declarations = [
            {
                "disasterNumber": 4085,
                "declarationTitle": "HURRICANE SANDY",
                "incidentType": "Hurricane",
                "declarationDate": "2012-10-30",
                "femaDeclarationString": "DR-4085-NY",
            }
        ]
        transformed = transform_projects(projects, applicants, declarations)
        self.assertEqual(len(transformed["projects"]), 1)
        row = transformed["projects"][0]
        self.assertEqual(transformed["applicants"][row["a"]]["name"], "City of New York")
        self.assertEqual(row["nyc"], 1)
        self.assertEqual(row["fs"], 3750000)
        report = validate_snapshot(projects, transformed)
        self.assertTrue(report["ok"])
        self.assertEqual(report["federalShare"]["sum"], 3750000)
        encoded = encode_public_snapshot(transformed, {"recordCount": 1})
        self.assertEqual(encoded["fields"][0], "gm")
        self.assertEqual(encoded["projects"][0][0], 111)
        self.assertEqual(encoded["nyc"]["111"], ["borough_county", "applicant_city", "applicant_name"])


if __name__ == "__main__":
    unittest.main()
